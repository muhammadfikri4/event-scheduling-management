"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, StickyNote, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Note {
  id: string; eventDate: string; time: string;
  title: string; content: string | null;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => { fetchNotes() }, [dateStr]);

  async function fetchNotes() {
    setNotes(await fetch(`/api/notes?eventDate=${dateStr}`).then((r) => r.json()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/notes/${editingId}` : "/api/notes";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate: dateStr, time, title, content: content || null }),
      });
      if (res.ok) {
        toast.success(editingId ? "Catatan diperbarui" : "Catatan ditambahkan");
        closeDialog(); fetchNotes();
      } else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.success("Catatan dihapus"); fetchNotes();
  }

  function openCreate() {
    setEditingId(null); setTime(format(new Date(), "HH:mm")); setTitle(""); setContent(""); setOpen(true);
  }
  function openEdit(n: Note) {
    setEditingId(n.id); setTime(n.time); setTitle(n.title); setContent(n.content || ""); setOpen(true);
  }
  function closeDialog() {
    setOpen(false); setEditingId(null); setTime(""); setTitle(""); setContent("");
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Catatan Harian</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Catat kejadian-kejadian penting setiap hari</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Catatan</Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value + "T00:00:00"))}
            className="w-auto h-8 text-sm"
          />
          <span className="text-sm font-medium capitalize text-muted-foreground">
            {format(selectedDate, "EEEE", { locale: localeId })}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSelectedDate(new Date())}>Hari Ini</Button>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <StickyNote className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">Belum ada catatan untuk tanggal ini</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> {n.time}
                    </span>
                    <h3 className="font-semibold text-sm truncate">{n.title}</h3>
                  </div>
                  {n.content && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                  )}
                </div>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Catatan" : "Tambah Catatan Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Waktu</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-32" />
            </div>
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Judul catatan" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Detail (opsional)</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detail kejadian..." rows={4} />
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
