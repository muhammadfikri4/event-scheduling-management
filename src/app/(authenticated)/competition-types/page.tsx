"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CompetitionType { id: string; name: string; code: string; color: string }

export default function CompetitionTypesPage() {
  const [types, setTypes] = useState<CompetitionType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#6366F1");

  useEffect(() => { fetchTypes() }, []);
  async function fetchTypes() { setTypes(await fetch("/api/competition-types").then((r) => r.json())) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/competition-types/${editingId}` : "/api/competition-types";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, code, color }) });
      if (res.ok) { toast.success(editingId ? "Jenis lomba diperbarui" : "Jenis lomba ditambahkan"); closeDialog(); fetchTypes() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jenis lomba ini?")) return;
    await fetch(`/api/competition-types/${id}`, { method: "DELETE" });
    toast.success("Jenis lomba dihapus"); fetchTypes();
  }

  function openCreate() { setEditingId(null); setName(""); setCode(""); setColor("#6366F1"); setOpen(true) }
  function openEdit(t: CompetitionType) { setEditingId(t.id); setName(t.name); setCode(t.code); setColor(t.color); setOpen(true) }
  function closeDialog() { setOpen(false); setEditingId(null); setName(""); setCode(""); setColor("#6366F1") }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Master Jenis Lomba</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Kelola jenis-jenis lomba</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Lomba</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Warna</TableHead>
              <TableHead className="w-20">Kode</TableHead>
              <TableHead>Nama Lomba</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((t) => (
              <TableRow key={t.id}>
                <TableCell><div className="w-6 h-6 rounded" style={{ backgroundColor: t.color }} /></TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{t.code}</Badge></TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {types.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Jenis Lomba" : "Tambah Jenis Lomba Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lomba</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama lomba" autoFocus />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Kode</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="RCR" />
              </div>
              <div className="space-y-2">
                <Label>Warna</Label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
              </div>
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
