"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { TableSkeleton } from "@/components/table-skeleton";

interface CompetitionType { id: string; name: string; code: string; color: string; logo: string | null }

export default function CompetitionTypesPage() {
  const [types, setTypes] = useState<CompetitionType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#6366F1");
  const [logo, setLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchTypes() }, []);
  async function fetchTypes() {
    setFetchLoading(true);
    setTypes(await fetch("/api/competition-types").then((r) => r.json()));
    setFetchLoading(false);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        setLogo(url);
      } else toast.error("Gagal upload logo");
    } finally { setUploading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/competition-types/${editingId}` : "/api/competition-types";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, code, color, logo }) });
      if (res.ok) { toast.success(editingId ? "Jenis lomba diperbarui" : "Jenis lomba ditambahkan"); closeDialog(); fetchTypes() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus jenis lomba ini?")) return;
    await fetch(`/api/competition-types/${id}`, { method: "DELETE" });
    toast.success("Jenis lomba dihapus"); fetchTypes();
  }

  function openCreate() { setEditingId(null); setName(""); setCode(""); setColor("#6366F1"); setLogo(null); setOpen(true) }
  function openEdit(t: CompetitionType) { setEditingId(t.id); setName(t.name); setCode(t.code); setColor(t.color); setLogo(t.logo); setOpen(true) }
  function closeDialog() { setOpen(false); setEditingId(null); setName(""); setCode(""); setColor("#6366F1"); setLogo(null) }

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
        {fetchLoading ? <TableSkeleton columns={4} /> : <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead className="w-20">Kode</TableHead>
              <TableHead>Nama Lomba</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {t.logo ? (
                    <Image src={t.logo} alt={t.name} width={32} height={32} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: t.color }} />
                  )}
                </TableCell>
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
        </Table>}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Jenis Lomba" : "Tambah Jenis Lomba Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo Lomba</Label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <div className="relative">
                    <Image src={logo} alt="Logo" width={64} height={64} className="w-16 h-16 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setLogo(null)} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = "" }} />
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP. Maks 2MB</p>
              </div>
            </div>

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
