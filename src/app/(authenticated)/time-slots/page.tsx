"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TimeSlot { id: string; startTime: string; endTime: string; order: number }

export default function TimeSlotsPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => { fetchSlots() }, []);
  async function fetchSlots() { setSlots(await fetch("/api/time-slots").then((r) => r.json())) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/time-slots/${editingId}` : "/api/time-slots";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startTime, endTime, order }) });
      if (res.ok) { toast.success(editingId ? "Slot waktu diperbarui" : "Slot waktu ditambahkan"); closeDialog(); fetchSlots() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus slot waktu ini?")) return;
    await fetch(`/api/time-slots/${id}`, { method: "DELETE" });
    toast.success("Slot waktu dihapus"); fetchSlots();
  }

  function openCreate() { setEditingId(null); setStartTime(""); setEndTime(""); setOrder(0); setOpen(true) }
  function openEdit(s: TimeSlot) { setEditingId(s.id); setStartTime(s.startTime); setEndTime(s.endTime); setOrder(s.order); setOpen(true) }
  function closeDialog() { setOpen(false); setEditingId(null); setStartTime(""); setEndTime(""); setOrder(0) }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Master Waktu</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Kelola slot waktu pertandingan</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Waktu</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead className="hidden sm:table-cell">Rentang</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-muted-foreground">{s.order}</TableCell>
                <TableCell className="font-medium">{s.startTime}</TableCell>
                <TableCell className="font-medium">{s.endTime}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">{s.startTime} – {s.endTime}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {slots.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Slot Waktu" : "Tambah Slot Waktu Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Jam Mulai</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Jam Selesai</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Urutan</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-24" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
