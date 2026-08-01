"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CurrencyInput } from "@/components/currency-input";
import Image from "next/image";
import { TableSkeleton } from "@/components/table-skeleton";

interface SizeStock { id: string; size: string; stock: number }
interface Product {
  id: string; name: string; sku: string; unit: string;
  stock: number; price: number; description: string | null;
  image: string | null; isClothing: boolean; sizes: string | null;
  sizeStocks: SizeStock[];
}

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", sku: "", unit: "pcs", price: 0, description: "",
    image: null as string | null, isClothing: false, sizes: "" as string,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts() }, []);
  async function fetchProducts() {
    setFetchLoading(true);
    setProducts(await fetch("/api/products").then((r) => r.json()));
    setFetchLoading(false);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f) => ({ ...f, image: url }));
      } else toast.error("Gagal upload foto");
    } finally { setUploading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...form,
        sizes: form.isClothing && form.sizes ? form.sizes : null,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { toast.success(editingId ? "Produk diperbarui" : "Produk ditambahkan"); closeDialog(); fetchProducts() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Produk dihapus"); fetchProducts();
  }

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", sku: "", unit: "pcs", price: 0, description: "", image: null, isClothing: false, sizes: JSON.stringify(DEFAULT_SIZES) });
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, sku: p.sku, unit: p.unit, price: p.price, description: p.description || "",
      image: p.image, isClothing: p.isClothing, sizes: p.sizes || JSON.stringify(DEFAULT_SIZES),
    });
    setOpen(true);
  }
  function closeDialog() { setOpen(false) }

  function parseSizes(s: string): string[] {
    try { return JSON.parse(s) } catch { return DEFAULT_SIZES }
  }

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
        {fetchLoading ? <TableSkeleton columns={7} /> : <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Foto</TableHead>
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
                <TableCell>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} width={36} height={36} className="w-9 h-9 rounded object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-muted-foreground">
                      {p.isClothing ? <Shirt className="w-4 h-4" /> : <span className="text-xs">{p.sku.slice(0, 2)}</span>}
                    </div>
                  )}
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{p.sku}</Badge></TableCell>
                <TableCell>
                  <span className="font-medium">{p.name}</span>
                  {p.isClothing && (
                    <div className="flex gap-1 mt-0.5">
                      {parseSizes(p.sizes || "[]").map((s) => (
                        <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell className="text-right">Rp {p.price.toLocaleString("id-ID")}</TableCell>
                <TableCell className="text-right">
                  {p.isClothing && p.sizeStocks.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {p.sizeStocks.map((ss) => (
                        <span key={ss.size} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ss.stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
                          {ss.size}:{ss.stock}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <Badge variant={p.stock > 0 ? "default" : "destructive"}>{p.stock}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada data produk</TableCell></TableRow>}
          </TableBody>
        </Table>}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Foto Produk</Label>
              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative">
                    <Image src={form.image} alt="Foto" width={72} height={72} className="w-18 h-18 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setForm({ ...form, image: null })} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-18 h-18 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors cursor-pointer">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = "" }} />
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP. Maks 2MB</p>
              </div>
            </div>

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

            {/* Clothing Flag */}
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <input
                type="checkbox"
                id="isClothing"
                checked={form.isClothing}
                onChange={(e) => setForm({ ...form, isClothing: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="isClothing" className="flex-1 cursor-pointer">
                <span className="flex items-center gap-1.5 text-sm font-medium"><Shirt className="w-4 h-4" /> Produk Pakaian</span>
                <span className="text-xs text-muted-foreground">Centang jika produk ini memiliki variasi ukuran</span>
              </label>
            </div>

            {form.isClothing && (
              <div className="space-y-2">
                <Label>Ukuran Tersedia</Label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
                    const current = parseSizes(form.sizes);
                    const active = current.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const next = active ? current.filter((s) => s !== size) : [...current, size];
                          setForm({ ...form, sizes: JSON.stringify(next) });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-accent"}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
