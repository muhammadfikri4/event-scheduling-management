"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize,
  Minimize,
  Megaphone,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface Team { id: string; name: string; color: string; logo: string | null }
interface CompetitionType { id: string; name: string; code: string; color: string; logo: string | null }
interface TimeSlot { id: string; startTime: string; endTime: string; order: number }
interface Schedule {
  id: string; teamId: string; competitionTypeId: string; timeSlotId: string;
  eventDate: string; status: string; completionTime: string | null;
  team: Team; competitionType: CompetitionType; timeSlot: TimeSlot;
}
interface Note { id: string; eventDate: string; time: string; title: string; content: string | null }

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; bg: string; text: string }> = {
  completed: { label: "Sudah Bermain", variant: "destructive", bg: "#22C55E", text: "#FFFFFF" },
  playing: { label: "Sedang Bermain", variant: "default", bg: "#3B82F6", text: "#FFFFFF" },
  standby: { label: "Standby", variant: "secondary", bg: "#FACC15", text: "#1A1A1A" },
  pending: { label: "Belum Bermain", variant: "outline", bg: "#FFFFFF", text: "#6B7280" },
  not_playing: { label: "Tidak Bermain", variant: "destructive", bg: "#EF4444", text: "#FFFFFF" },
};

export default function LivePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [types, setTypes] = useState<CompetitionType[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [detail, setDetail] = useState<Schedule | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    const [t, s] = await Promise.all([
      fetch("/api/competition-types").then((r) => r.json()),
      fetch("/api/time-slots").then((r) => r.json()),
    ]);
    setTypes(t); setSlots(s);
  }, []);

  useEffect(() => { fetchData() }, [fetchData]);

  const fetchSchedules = useCallback(async () => {
    setSchedules(await fetch(`/api/schedules?eventDate=${dateStr}`).then((r) => r.json()));
  }, [dateStr]);

  useEffect(() => { fetchSchedules() }, [fetchSchedules]);

  useEffect(() => {
    fetch(`/api/notes?eventDate=${dateStr}`).then((r) => r.json()).then(setNotes);
  }, [dateStr]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => { fetchSchedules(); fetch(`/api/notes?eventDate=${dateStr}`).then((r) => r.json()).then(setNotes) }, 30000);
    return () => clearInterval(interval);
  }, [fetchSchedules, dateStr]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && fullscreen) setFullscreen(false) };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [fullscreen]);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchSchedules()]);
    const n = await fetch(`/api/notes?eventDate=${dateStr}`).then((r) => r.json());
    setNotes(n);
    setRefreshing(false);
  }

  const findSchedule = (tsId: string, ctId: string) =>
    schedules.find((s) => s.timeSlotId === tsId && s.competitionTypeId === ctId && s.eventDate === dateStr);

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "flex flex-col h-screen"}>
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={process.env.NEXT_PUBLIC_LOGO || "/imerc-logo.png"} alt="IMERC" className="h-8 w-auto" />
          <h1 className="text-base font-semibold tracking-tight">Live Jadwal</h1>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedDate(new Date())}>Hari Ini</Button>
          <div className="inline-flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate((d) => addDays(d, -1))}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate((d) => addDays(d, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <DatePicker value={selectedDate} onChange={(d) => d && setSelectedDate(d)} className="h-7 text-xs" />
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto sm:ml-1" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
      <div className="flex-1 overflow-auto">
        {(() => {
          const activeSlots = slots.filter((slot) => schedules.some((s) => s.timeSlotId === slot.id));
          const displaySlots = activeSlots.length > 0 ? activeSlots : slots;
          return (
        <table className="w-full min-w-[600px] text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-center text-[11px] font-bold text-white uppercase tracking-wider bg-[#1E293B] border border-[#334155] w-28">
                TIME
              </th>
              {types.map((t) => (
                <th key={t.id} className="px-3 py-3 text-center text-[11px] font-bold text-white uppercase tracking-wider border border-white/10" style={{ backgroundColor: t.color }}>
                  <div className="flex items-center justify-center gap-1.5">
                    {t.logo && <Image src={t.logo} alt={t.code} width={24} height={24} className="w-6 h-6 rounded object-cover" />}
                    <span>{t.name} ({t.code})</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displaySlots.map((slot) => (
              <tr key={slot.id}>
                <td className="px-3 py-3 border border-[#334155] bg-[#1E293B] text-white text-center font-bold text-xs whitespace-nowrap">
                  {slot.startTime} – {slot.endTime}
                </td>
                {types.map((type) => {
                  const s = findSchedule(slot.id, type.id);
                  const st = s ? STATUS[s.status] : null;
                  return (
                    <td key={type.id} className="px-3 py-3 border border-gray-200 text-center" style={st ? { backgroundColor: st.bg } : {}}>
                      {s ? (
                        <button onClick={() => setDetail(s)} className="w-full hover:opacity-70 transition-opacity" title={s.team.name}>
                          <div className="flex items-center justify-center gap-1.5">
                            {s.team.logo && <Image src={s.team.logo} alt={s.team.name} width={20} height={20} className="w-5 h-5 rounded-full object-cover shrink-0" />}
                            <span className="font-semibold text-xs truncate max-w-[120px]" style={{ color: st!.text }}>{s.team.name}</span>
                          </div>
                          {s.completionTime && (
                            <span className="text-[10px] opacity-70 block mt-0.5" style={{ color: st!.text }}>{s.completionTime}</span>
                          )}
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
          );
        })()}
      </div>

      {/* Broadcast (Right Sidebar) */}
      {notes.length > 0 && (
        <div className="hidden lg:flex w-64 border-l flex-col shrink-0">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b">
            <Megaphone className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pengumuman</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="text-sm">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{note.time}</span>
                </div>
                <p className="font-medium text-sm">{note.title}</p>
                {note.content && <p className="text-xs text-muted-foreground mt-0.5">{note.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center gap-3 px-4 lg:px-6 py-2.5 border-t text-xs shrink-0">
        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Keterangan:</span>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: v.bg }} />
            <span className="text-[11px] font-medium text-foreground">{v.label}</span>
          </div>
        ))}
      </footer>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="w-4 h-4" /> Detail Jadwal</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">{format(new Date(detail.eventDate + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
              <Separator />
              <div className="grid grid-cols-[100px_1fr] gap-y-3">
                <span className="text-muted-foreground">Tim</span>
                <span className="font-medium flex items-center gap-2" style={{ color: detail.team.color }}>
                  {detail.team.logo && <Image src={detail.team.logo} alt={detail.team.name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />}
                  {detail.team.name}
                </span>
                <span className="text-muted-foreground">Lomba</span>
                <span className="flex items-center gap-2">
                  {detail.competitionType.logo && <Image src={detail.competitionType.logo} alt={detail.competitionType.code} width={24} height={24} className="w-6 h-6 rounded object-cover" />}
                  {detail.competitionType.name} ({detail.competitionType.code})
                </span>
                <span className="text-muted-foreground">Waktu</span>
                <span>{detail.timeSlot.startTime} – {detail.timeSlot.endTime}</span>
                <span className="text-muted-foreground">Status</span>
                <Badge variant={STATUS[detail.status]?.variant} className="w-fit">{STATUS[detail.status]?.label}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
