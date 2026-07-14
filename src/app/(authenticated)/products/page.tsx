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
import { CurrencyInput } from "@/components/currency-input";

interface Product {
  id: string; name: string; sku: string; unit: string;
  stock: number; price: number; description: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", unit: "pcs", price: 0, description: "" });

  useEffect(() => { fetchProducts() }, []);
  async function fetchProducts() { setProducts(await fetch("/api/products").then((r) => r.json())) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { toast.success(editingId ? "Produk diperbarui" : "Produk ditambahkan"); closeDialog(); fetchProducts() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Produk dihapus"); fetchProducts();
  }

  function openCreate() { setEditingId(null); setForm({ name: "", sku: "", unit: "pcs", price: 0, description: "" }); setOpen(true) }
  function openEdit(p: Product) { setEditingId(p.id); setForm({ name: p.name, sku: p.sku, unit: p.unit, price: p.price, description: p.description || "" }); setOpen(true) }
  function closeDialog() { setOpen(false) }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Master Produk</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Kelola data produk / item</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Produk</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Badge variant="secondary" className="text-xs">{p.sku}</Badge></TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell className="text-right">Rp {p.price.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={p.stock > 0 ? "default" : "destructive"}>{p.stock}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data produk</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Nama Produk</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nama produk" autoFocus />
              </div>
              <div className="w-32 space-y-2">
                <Label>Kode</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} required placeholder="Kode001" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Harga</Label>
                <CurrencyInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              </div>
              <div className="w-32 space-y-2">
                <Label>Satuan</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opsional" />
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
