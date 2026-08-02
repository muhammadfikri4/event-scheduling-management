"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/table-skeleton";

interface User {
  id: string; username: string; name: string;
  role: string; isActive: boolean; createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  organizer: "Organizer",
  cashier: "Cashier",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  organizer: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  cashier: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "cashier" });
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setCurrentUserId(d.userId));
  }, []);
  async function fetchUsers() {
    setFetchLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    else toast.error("Tidak memiliki akses");
    setFetchLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.name || !form.role) { toast.error("Semua field wajib diisi"); return }
    if (!editingId && !form.password) { toast.error("Password wajib diisi"); return }
    setLoading(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { username: form.username, name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) }
        : form;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingId ? "User diperbarui" : "User ditambahkan");
        closeDialog(); fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } finally { setLoading(false) }
  }

  async function handleRoleChange(userId: string, role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { toast.success("Role diperbarui"); fetchUsers() }
    else toast.error("Gagal mengubah role");
  }

  async function handleToggleActive(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) {
      toast.success(user.isActive ? "User dinonaktifkan" : "User diaktifkan");
      fetchUsers();
    } else toast.error("Gagal mengubah status");
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("User dihapus"); fetchUsers() }
    else { const err = await res.json(); toast.error(err.error || "Gagal menghapus") }
  }

  function openCreate() {
    setEditingId(null); setForm({ username: "", password: "", name: "", role: "cashier" }); setShowPassword(false); setOpen(true);
  }
  function openEdit(u: User) {
    setEditingId(u.id); setForm({ username: u.username, password: "", name: u.name, role: u.role }); setShowPassword(false); setOpen(true);
  }
  function closeDialog() { setOpen(false) }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Kelola pengguna sistem</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah User</Button>
      </div>

      <Card>
        {fetchLoading ? <TableSkeleton columns={6} /> : <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Dibuat</TableHead>
              <TableHead className="text-right w-32">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className={!u.isActive ? "opacity-50" : ""}>
                <TableCell className="font-mono text-sm">{u.username}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  {u.id === currentUserId ? (
                    <span className="text-sm">{ROLE_LABELS[u.role] || u.role}</span>
                  ) : (
                    <Select value={u.role} onValueChange={(v) => v && handleRoleChange(u.id, v)}>
                      <SelectTrigger size="sm" className="h-7 w-auto text-xs">
                        <SelectValue>{ROLE_LABELS[u.role]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => u.id !== currentUserId && handleToggleActive(u)}
                    disabled={u.id === currentUserId}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${u.id === currentUserId ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${u.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${u.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {format(new Date(u.createdAt), "d MMM yyyy", { locale: localeId })}
                </TableCell>
                <TableCell className="text-right">
                  {u.role !== "super_admin" && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>}
          </TableBody>
        </Table>}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit User" : "Tambah User Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nama lengkap" autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required placeholder="Username untuk login" />
            </div>
            <div className="space-y-2">
              <Label>Password {editingId && <span className="text-muted-foreground font-normal">(kosongkan jika tidak diubah)</span>}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingId ? "Kosongkan jika tidak diubah" : "Password"}
                    required={!editingId}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => {
                  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                  const pw = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
                  setForm({ ...form, password: pw });
                  setShowPassword(true);
                }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => v && setForm({ ...form, role: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue>{ROLE_LABELS[form.role]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organizer">Organizer — akses penjadwalan lomba</SelectItem>
                  <SelectItem value="cashier">Cashier — akses point of sales</SelectItem>
                </SelectContent>
              </Select>
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
