"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Users, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

interface TeamMember { id?: string; name: string }
interface Team {
  id: string; name: string; color: string; logo: string | null;
  managerName: string | null; managerPhone: string | null;
  members: TeamMember[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [logo, setLogo] = useState<string | null>(null);
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchTeams() }, []);
  async function fetchTeams() { setTeams(await fetch("/api/teams").then((r) => r.json())) }

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

  function addMember() {
    if (!newMember.trim()) return;
    setMembers([...members, { name: newMember.trim() }]);
    setNewMember("");
  }

  function removeMember(idx: number) {
    setMembers(members.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/teams/${editingId}` : "/api/teams";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, color, logo,
          managerName: managerName || null,
          managerPhone: managerPhone || null,
          members: members.map((m) => ({ name: m.name })),
        }),
      });
      if (res.ok) { toast.success(editingId ? "Tim diperbarui" : "Tim ditambahkan"); closeDialog(); fetchTeams() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus tim ini?")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    toast.success("Tim dihapus"); fetchTeams();
  }

  function openCreate() {
    setEditingId(null); setName(""); setColor("#3B82F6"); setLogo(null);
    setManagerName(""); setManagerPhone(""); setMembers([]); setNewMember(""); setOpen(true);
  }
  function openEdit(t: Team) {
    setEditingId(t.id); setName(t.name); setColor(t.color); setLogo(t.logo);
    setManagerName(t.managerName || ""); setManagerPhone(t.managerPhone || "");
    setMembers(t.members || []); setNewMember(""); setOpen(true);
  }
  function closeDialog() {
    setOpen(false); setEditingId(null); setName(""); setColor("#3B82F6"); setLogo(null);
    setManagerName(""); setManagerPhone(""); setMembers([]); setNewMember("");
  }

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
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nama Tim</TableHead>
              <TableHead className="hidden md:table-cell">Manager</TableHead>
              <TableHead className="hidden lg:table-cell">Anggota</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {t.logo ? (
                    <Image src={t.logo} alt={t.name} width={32} height={32} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: t.color }} />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {t.managerName || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {t.members?.length || 0} orang
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada data tim</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Tim" : "Tambah Tim Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo Tim</Label>
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

            {/* Name & Color */}
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-2">
                <Label>Nama Tim</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masukkan nama tim" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Warna</Label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
              </div>
            </div>

            {/* Manager */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Manager Tim</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Nama manager" />
                <Input value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} placeholder="No. HP" />
              </div>
            </div>

            {/* Members */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Anggota Tim</Label>
              <div className="flex gap-2">
                <Input
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  placeholder="Nama anggota"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember() } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addMember} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {members.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                      <span>{m.name}</span>
                      <button type="button" onClick={() => removeMember(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
