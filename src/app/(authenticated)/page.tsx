"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  addYears,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  getDay,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Team { id: string; name: string; color: string }
interface CompetitionType { id: string; name: string; code: string; color: string }
interface TimeSlot { id: string; startTime: string; endTime: string; order: number }
interface Schedule {
  id: string; teamId: string; competitionTypeId: string; timeSlotId: string;
  eventDate: string; status: string;
  team: Team; competitionType: CompetitionType; timeSlot: TimeSlot;
}

type ViewMode = "day" | "week" | "month" | "year" | "grid";

const VIEW_LABELS: Record<ViewMode, string> = {
  day: "Hari", week: "Minggu", month: "Bulan", year: "Tahun", grid: "Grid",
};

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Belum Bermain", variant: "outline" },
  standby: { label: "Standby", variant: "secondary" },
  playing: { label: "Sedang Bermain", variant: "default" },
  completed: { label: "Sudah Bermain", variant: "destructive" },
};

export default function DashboardPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [types, setTypes] = useState<CompetitionType[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [detail, setDetail] = useState<Schedule | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const fetchData = useCallback(async () => {
    const [t, s] = await Promise.all([
      fetch("/api/competition-types").then((r) => r.json()),
      fetch("/api/time-slots").then((r) => r.json()),
    ]);
    setTypes(t); setSlots(s);
  }, []);

  useEffect(() => { fetchData() }, [fetchData]);

  const fetchSchedules = useCallback(async () => {
    let url: string;
    if (viewMode === "day" || viewMode === "grid") {
      url = `/api/schedules?eventDate=${format(selectedDate, "yyyy-MM-dd")}`;
    } else if (viewMode === "week") {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
      url = `/api/schedules?startDate=${format(ws, "yyyy-MM-dd")}&endDate=${format(addDays(ws, 6), "yyyy-MM-dd")}`;
    } else if (viewMode === "month") {
      url = `/api/schedules?startDate=${format(startOfMonth(selectedDate), "yyyy-MM-dd")}&endDate=${format(endOfMonth(selectedDate), "yyyy-MM-dd")}`;
    } else {
      // year — fetch entire year in 1 request
      url = `/api/schedules?startDate=${selectedDate.getFullYear()}-01-01&endDate=${selectedDate.getFullYear()}-12-31`;
    }
    const res = await fetch(url);
    setSchedules(await res.json());
  }, [selectedDate, viewMode]);

  useEffect(() => { fetchSchedules() }, [fetchSchedules]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && fullscreen) setFullscreen(false) };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [fullscreen]);

  function navigate(d: number) {
    setSelectedDate((p) => {
      if (viewMode === "day" || viewMode === "grid") return addDays(p, d);
      if (viewMode === "week") return addDays(p, d * 7);
      if (viewMode === "month") return addMonths(p, d);
      return addYears(p, d);
    });
  }

  function getDateLabel() {
    if (viewMode === "week") {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(ws, "d MMM", { locale: localeId })} – ${format(addDays(ws, 6), "d MMM yyyy", { locale: localeId })}`;
    }
    if (viewMode === "month") return format(selectedDate, "MMMM yyyy", { locale: localeId });
    if (viewMode === "year") return format(selectedDate, "yyyy");
    return format(selectedDate, "EEEE, d MMM yyyy", { locale: localeId });
  }

  const findSchedule = (tsId: string, ctId: string, date?: string) =>
    schedules.find((s) => s.timeSlotId === tsId && s.competitionTypeId === ctId && s.eventDate === (date || format(selectedDate, "yyyy-MM-dd")));
  const getForDate = (date: string) => schedules.filter((s) => s.eventDate === date);

  function getMonthGrid() {
    const ms = startOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: ms, end: endOfMonth(selectedDate) });
    const dow = getDay(ms);
    const offset = dow === 0 ? 6 : dow - 1;
    const cells: (Date | null)[] = [...Array.from({ length: offset }, (): null => null), ...days];
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    if (rows.length > 0) while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);
    return rows;
  }

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "flex flex-col flex-1"}>
      {/* ── HEADER ── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 py-3 border-b shrink-0">
        <h1 className="text-base font-semibold tracking-tight">Dashboard Jadwal</h1>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex rounded-md border overflow-hidden">
            {(["day", "week", "month", "year", "grid"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                {VIEW_LABELS[m]}
              </button>
            ))}
          </div>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedDate(new Date())}>Hari Ini</Button>
          <div className="inline-flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <span className="text-sm font-medium capitalize">{getDateLabel()}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto sm:ml-1" onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-auto relative">

        {/* ──── GRID ──── */}
        {viewMode === "grid" && (
          <table className="w-full min-w-[600px] text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-background">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border-b border-r w-24">Waktu</th>
                {types.map((t) => (
                  <th key={t.id} className="px-4 py-3 text-center font-medium border-b border-r last:border-r-0" style={{ color: t.color }}>
                    {t.code}<span className="hidden sm:inline text-muted-foreground font-normal"> – {t.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-muted/20">
                  <td className="px-4 py-4 border-b border-r align-top font-semibold text-xs">
                    {slot.startTime}<span className="font-normal text-muted-foreground block">{slot.endTime}</span>
                  </td>
                  {types.map((type) => {
                    const s = findSchedule(slot.id, type.id);
                    return (
                      <td key={type.id} className="px-2 py-2 border-b border-r last:border-r-0 align-top">
                        {s && (
                          <button onClick={() => setDetail(s)} className="w-full rounded border-l-[3px] px-2.5 py-2 text-xs text-left bg-muted/30 hover:bg-muted/50 transition-colors" style={{ borderLeftColor: s.team.color }}>
                            <span className="font-medium block truncate">{s.team.name}</span>
                            <span className="text-muted-foreground text-[10px]">{s.competitionType.code}</span>
                            <Badge variant={STATUS[s.status]?.variant} className="mt-1 text-[10px] px-1.5 py-0 block w-fit">{STATUS[s.status]?.label}</Badge>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ──── DAY ──── */}
        {viewMode === "day" && (
          <div className="flex flex-col h-full">
            {slots.map((slot) => {
              const items = schedules.filter((s) => s.timeSlotId === slot.id);
              return (
                <div key={slot.id} className="flex border-b flex-1">
                  <div className="w-20 shrink-0 border-r text-right px-3 pt-3">
                    <span className="text-xs font-semibold">{slot.startTime}</span>
                    <span className="text-[10px] text-muted-foreground block">{slot.endTime}</span>
                  </div>
                  <div className="flex-1 p-2">
                    {items.map((s) => (
                      <button key={s.id} onClick={() => setDetail(s)}
                        className="rounded border-l-[3px] px-2.5 py-1.5 text-xs mb-1 block bg-muted/30 hover:bg-muted/50 transition-colors max-w-xs text-left"
                        style={{ borderLeftColor: s.team.color }}>
                        <span className="font-medium" style={{ color: s.team.color }}>{s.team.name}</span>
                        <span className="text-muted-foreground ml-1">{s.competitionType.code}</span>
                        <span className="text-muted-foreground ml-1">{s.timeSlot.startTime}–{s.timeSlot.endTime}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──── WEEK ──── */}
        {viewMode === "week" && (
          <div className="flex flex-col h-full min-w-[700px]">
            {/* Day header */}
            <div className="flex border-b sticky top-0 z-10 bg-background shrink-0">
              <div className="w-20 shrink-0 border-r" />
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i);
                const today = isSameDay(d, new Date());
                return (
                  <div key={i} className="flex-1 text-center py-3 border-r last:border-r-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{format(d, "EEE", { locale: localeId })}</span>
                    <span className={`block text-xl font-semibold leading-none mt-1 ${today ? "bg-primary text-primary-foreground rounded-full w-9 h-9 leading-9 mx-auto" : ""}`}>
                      {format(d, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Time rows — each row stretches equally */}
            {slots.map((slot) => (
              <div key={slot.id} className="flex border-b flex-1">
                <div className="w-20 shrink-0 border-r text-right px-3 pt-2">
                  <span className="text-xs font-semibold">{slot.startTime}</span>
                  <span className="text-[10px] text-muted-foreground block">{slot.endTime}</span>
                </div>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i), "yyyy-MM-dd");
                  const items = getForDate(date).filter((s) => s.timeSlotId === slot.id);
                  return (
                    <div key={i} className="flex-1 border-r last:border-r-0 p-1">
                      {items.map((s) => (
                        <button key={s.id} onClick={() => setDetail(s)}
                          className="w-full rounded border-l-[3px] px-2 py-1.5 text-[11px] mb-0.5 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
                          style={{ borderLeftColor: s.team.color }}>
                          <span className="font-medium truncate block" style={{ color: s.team.color }}>{s.team.name}</span>
                          <span className="text-muted-foreground">{s.competitionType.code}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ──── MONTH ──── */}
        {viewMode === "month" && (() => {
          const rows = getMonthGrid();
          return (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-7 border-b sticky top-0 z-10 bg-background shrink-0">
                {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((d) => (
                  <div key={d} className="text-center py-2 text-[10px] font-semibold text-muted-foreground tracking-widest border-r last:border-r-0">{d}</div>
                ))}
              </div>
              {rows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-7 border-b flex-1">
                  {row.map((day, ci) => {
                    if (!day) return <div key={ci} className="border-r last:border-r-0 bg-muted/5" />;
                    const dateStr = format(day, "yyyy-MM-dd");
                    const ds = getForDate(dateStr);
                    const today = isSameDay(day, new Date());
                    const cur = isSameMonth(day, selectedDate);
                    return (
                      <div key={ci} className={`border-r last:border-r-0 p-1.5 min-h-[90px] ${!cur ? "bg-muted/5 text-muted-foreground/50" : ""}`}>
                        <span className={`text-xs inline-flex items-center justify-center mb-1 ${today ? "bg-primary text-primary-foreground rounded-full w-6 h-6 font-bold" : "font-medium px-0.5"}`}>
                          {format(day, "d")}
                        </span>
                        <div className="space-y-0.5">
                          {ds.slice(0, 3).map((s) => (
                            <button key={s.id} onClick={() => setDetail(s)}
                              className="w-full rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] truncate text-left text-white hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: s.team.color }}>
                              {s.timeSlot.startTime} {s.team.name} · {s.competitionType.code}
                            </button>
                          ))}
                          {ds.length > 3 && <span className="text-[10px] text-muted-foreground px-1 cursor-pointer hover:underline">+{ds.length - 3} lainnya</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ──── YEAR ──── */}
        {viewMode === "year" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-8 p-6 lg:p-8">
            {Array.from({ length: 12 }, (_, mi) => {
              const md = new Date(selectedDate.getFullYear(), mi, 1);
              const days = eachDayOfInterval({ start: startOfMonth(md), end: endOfMonth(md) });
              const dow = getDay(startOfMonth(md));
              const off = dow === 0 ? 6 : dow - 1;
              return (
                <div key={mi}>
                  <button className="text-sm font-semibold mb-3 capitalize hover:text-primary transition-colors"
                    onClick={() => { setSelectedDate(md); setViewMode("month") }}>
                    {format(md, "MMMM", { locale: localeId })}
                  </button>
                  <div className="grid grid-cols-7 gap-y-0.5 text-[11px]">
                    {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                      <span key={i} className="text-center text-muted-foreground/50 font-medium">{d}</span>
                    ))}
                    {Array.from({ length: off }, (_, i) => <span key={`e-${i}`} />)}
                    {days.map((day) => {
                      const ds = format(day, "yyyy-MM-dd");
                      const count = getForDate(ds).length;
                      const today = isSameDay(day, new Date());
                      return (
                        <button key={ds} onClick={() => { setSelectedDate(day); setViewMode("day") }}
                          className={`text-center py-0.5 rounded-full transition-colors
                            ${today ? "bg-primary text-primary-foreground font-bold" : count > 0 ? "bg-primary/15 font-semibold text-primary" : "hover:bg-accent"}`}>
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER LEGEND ── */}
      <footer className="flex items-center gap-3 px-4 lg:px-6 py-2 border-t text-xs text-muted-foreground shrink-0">
        <span className="font-medium">Keterangan:</span>
        {Object.entries(STATUS).map(([k, v]) => (
          <Badge key={k} variant={v.variant} className="text-[10px]">{v.label}</Badge>
        ))}
      </footer>

      {/* ── DETAIL ── */}
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
                <span className="font-medium" style={{ color: detail.team.color }}>{detail.team.name}</span>
                <span className="text-muted-foreground">Lomba</span>
                <span>{detail.competitionType.name} ({detail.competitionType.code})</span>
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
