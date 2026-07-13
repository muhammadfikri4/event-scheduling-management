"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Team { id: string; name: string; color: string }
interface CompetitionType { id: string; name: string; code: string; color: string }
interface TimeSlot { id: string; startTime: string; endTime: string; order: number }
interface Schedule {
  id: string; teamId: string; competitionTypeId: string; timeSlotId: string;
  eventDate: string; status: string;
  team: Team; competitionType: CompetitionType; timeSlot: TimeSlot;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Belum Bermain" },
  { value: "standby", label: "Standby" },
  { value: "playing", label: "Sedang Bermain" },
  { value: "completed", label: "Sudah Bermain" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", standby: "secondary", playing: "default", completed: "destructive",
};

// Draggable schedule card
function DraggableSchedule({ schedule, onDelete, onStatusChange }: {
  schedule: Schedule;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: schedule.id,
    data: { schedule },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-1.5 ${isDragging ? "opacity-30" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="rounded px-2 py-1.5 text-xs font-medium text-white cursor-grab active:cursor-grabbing flex items-center gap-1"
        style={{ backgroundColor: schedule.team.color }}
      >
        <GripVertical className="w-3 h-3 opacity-60 shrink-0" />
        <span className="truncate">{schedule.team.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Select value={schedule.status} onValueChange={(v) => v && onStatusChange(schedule.id, v)}>
          <SelectTrigger size="sm" className="h-6 text-[11px] flex-1">
            <SelectValue placeholder="Status">
              {STATUS_OPTIONS.find((o) => o.value === schedule.status)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button onClick={() => onDelete(schedule.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Droppable cell
function DroppableCell({ slotId, typeId, children }: {
  slotId: string;
  typeId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${slotId}::${typeId}`,
    data: { slotId, typeId },
  });

  return (
    <td
      ref={setNodeRef}
      className={`p-2 border-l group transition-colors min-w-[120px] ${isOver ? "bg-primary/10 ring-2 ring-primary/30 ring-inset" : ""}`}
    >
      {children}
    </td>
  );
}

export default function SchedulesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [types, setTypes] = useState<CompetitionType[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ teamId: "", competitionTypeId: "", timeSlotId: "", status: "pending" });
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/competition-types").then((r) => r.json()),
      fetch("/api/time-slots").then((r) => r.json()),
    ]).then(([t, c, s]) => { setTeams(t); setTypes(c); setSlots(s) });
  }, []);

  const eventDateStr = format(eventDate, "yyyy-MM-dd");

  const fetchSchedules = useCallback(async () => {
    setSchedules(await fetch(`/api/schedules?eventDate=${eventDateStr}`).then((r) => r.json()));
  }, [eventDateStr]);

  useEffect(() => { fetchSchedules() }, [fetchSchedules]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.teamId || !formData.competitionTypeId || !formData.timeSlotId) {
      toast.error("Semua field harus diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventDate: eventDateStr }),
      });
      if (res.ok) { toast.success("Jadwal ditambahkan"); closeDialog(); fetchSchedules() }
      else toast.error("Gagal menambahkan jadwal");
    } finally { setLoading(false) }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/schedules/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchSchedules();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    toast.success("Jadwal dihapus"); fetchSchedules();
  }

  function openCreate() { setFormData({ teamId: "", competitionTypeId: "", timeSlotId: "", status: "pending" }); setOpen(true) }
  function closeDialog() { setOpen(false) }

  const findSchedule = (tsId: string, ctId: string) =>
    schedules.find((s) => s.timeSlotId === tsId && s.competitionTypeId === ctId);

  function handleDragStart(event: DragStartEvent) {
    const schedule = event.active.data.current?.schedule as Schedule;
    setActiveSchedule(schedule);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveSchedule(null);
    const { active, over } = event;
    if (!over) return;

    const schedule = active.data.current?.schedule as Schedule;
    const { slotId, typeId } = over.data.current as { slotId: string; typeId: string };

    // Same position — no change
    if (schedule.timeSlotId === slotId && schedule.competitionTypeId === typeId) return;

    // Check if target cell is already occupied
    const existing = findSchedule(slotId, typeId);
    if (existing) {
      toast.error("Slot sudah terisi tim lain");
      return;
    }

    // Find new references for optimistic update
    const newSlot = slots.find((s) => s.id === slotId);
    const newType = types.find((t) => t.id === typeId);

    // Optimistic update — move immediately in UI
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === schedule.id
          ? {
              ...s,
              timeSlotId: slotId,
              competitionTypeId: typeId,
              timeSlot: newSlot || s.timeSlot,
              competitionType: newType || s.competitionType,
            }
          : s
      )
    );
    toast.success(`${schedule.team.name} dipindahkan`);

    // Sync to API in background
    const res = await fetch(`/api/schedules/${schedule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeSlotId: slotId, competitionTypeId: typeId }),
    });

    // If API fails, revert
    if (!res.ok) {
      toast.error("Gagal memindahkan, dikembalikan");
      fetchSchedules();
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Buat Jadwal</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Atur jadwal pertandingan tim — drag & drop untuk pindahkan</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker value={eventDate} onChange={(d) => d && setEventDate(d)} />
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah</Button>
        </div>
      </div>

      <Card className="overflow-auto">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground w-24 sm:w-32">Waktu</th>
                {types.map((t) => (
                  <th key={t.id} className="p-3 text-center font-medium border-l" style={{ color: t.color }}>
                    {t.code}<span className="hidden sm:inline text-muted-foreground font-normal"> – {t.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b last:border-0">
                  <td className="p-3 border-r">
                    <span className="font-semibold">{slot.startTime}</span>
                    <span className="text-muted-foreground text-xs block">{slot.endTime}</span>
                  </td>
                  {types.map((type) => {
                    const s = findSchedule(slot.id, type.id);
                    return (
                      <DroppableCell key={type.id} slotId={slot.id} typeId={type.id}>
                        {s ? (
                          <DraggableSchedule
                            schedule={s}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                          />
                        ) : (
                          <span className="text-muted-foreground/30 block text-center">—</span>
                        )}
                      </DroppableCell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <DragOverlay>
            {activeSchedule && (
              <div
                className="rounded px-3 py-2 text-xs font-medium text-white shadow-lg cursor-grabbing"
                style={{ backgroundColor: activeSchedule.team.color, minWidth: 100 }}
              >
                {activeSchedule.team.name}
                <span className="opacity-70 ml-1">→ {activeSchedule.competitionType.code}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium">Keterangan:</span>
        {STATUS_OPTIONS.map((s) => <Badge key={s.value} variant={STATUS_VARIANT[s.value]} className="text-[10px]">{s.label}</Badge>)}
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tim</Label>
              <Select value={formData.teamId} onValueChange={(v) => v && setFormData({ ...formData, teamId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Tim" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Jenis Lomba</Label>
                <Select value={formData.competitionTypeId} onValueChange={(v) => v && setFormData({ ...formData, competitionTypeId: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Lomba" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Slot Waktu</Label>
                <Select value={formData.timeSlotId} onValueChange={(v) => v && setFormData({ ...formData, timeSlotId: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.startTime} – {s.endTime}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => v && setFormData({ ...formData, status: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
