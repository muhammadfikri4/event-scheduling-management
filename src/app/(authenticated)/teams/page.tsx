"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Team { id: string; name: string; color: string }

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");

  useEffect(() => { fetchTeams() }, []);
  async function fetchTeams() { setTeams(await fetch("/api/teams").then((r) => r.json())) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/teams/${editingId}` : "/api/teams";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color }) });
      if (res.ok) { toast.success(editingId ? "Tim diperbarui" : "Tim ditambahkan"); closeDialog(); fetchTeams() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus tim ini?")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    toast.success("Tim dihapus"); fetchTeams();
  }

  function openCreate() { setEditingId(null); setName(""); setColor("#3B82F6"); setOpen(true) }
  function openEdit(t: Team) { setEditingId(t.id); setName(t.name); setColor(t.color); setOpen(true) }
  function closeDialog() { setOpen(false); setEditingId(null); setName(""); setColor("#3B82F6") }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Master Tim</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Kelola data tim yang bertanding</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Tim</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Warna</TableHead>
              <TableHead>Nama Tim</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.id}>
                <TableCell><div className="w-6 h-6 rounded" style={{ backgroundColor: t.color }} /></TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Belum ada data tim</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Tim" : "Tambah Tim Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Tim</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masukkan nama tim" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
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
