"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Upload, X, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import { NumberInput } from "@/components/number-input";
import { toast } from "sonner";
import Image from "next/image";
import { TableSkeleton } from "@/components/table-skeleton";

interface SizeStock { size: string; stock: number }
interface Product { id: string; name: string; sku: string; unit: string; stock: number; price: number; image: string | null; isClothing: boolean; sizes: string | null; sizeStocks: SizeStock[] }
interface BundleItem { id: string; productId: string; quantity: number; size: string | null; product: Product }
interface Bundle { id: string; name: string; sku: string; price: number; image: string | null; description: string | null; items: BundleItem[] }

interface FormItem { productId: string; quantity: number; size: string }

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", price: 0, image: null as string | null, description: "" });
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [newItem, setNewItem] = useState<FormItem>({ productId: "", quantity: 1, size: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetchBundles(),
      fetch("/api/products").then((r) => r.json()).then(setProducts),
    ]).then(() => setFetchLoading(false));
  }, []);

  async function fetchBundles() { setBundles(await fetch("/api/bundles").then((r) => r.json())) }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) { const { url } = await res.json(); setForm((f) => ({ ...f, image: url })) }
      else toast.error("Gagal upload foto");
    } finally { setUploading(false) }
  }

  function addItem() {
    if (!newItem.productId) { toast.error("Pilih produk"); return }
    const exists = formItems.find((i) => i.productId === newItem.productId && i.size === newItem.size);
    if (exists) { toast.error("Produk sudah ada di bundling"); return }
    setFormItems([...formItems, { ...newItem }]);
    setNewItem({ productId: "", quantity: 1, size: "" });
  }

  function removeItem(idx: number) { setFormItems(formItems.filter((_, i) => i !== idx)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formItems.length < 2) { toast.error("Bundling minimal 2 produk"); return }
    setLoading(true);
    try {
      const url = editingId ? `/api/bundles/${editingId}` : "/api/bundles";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: formItems.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size || undefined })),
        }),
      });
      if (res.ok) { toast.success(editingId ? "Bundling diperbarui" : "Bundling ditambahkan"); closeDialog(); fetchBundles() }
      else toast.error("Gagal menyimpan");
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus bundling ini?")) return;
    await fetch(`/api/bundles/${id}`, { method: "DELETE" });
    toast.success("Bundling dihapus"); fetchBundles();
  }

  function openCreate() {
    setEditingId(null); setForm({ name: "", sku: "", price: 0, image: null, description: "" });
    setFormItems([]); setNewItem({ productId: "", quantity: 1, size: "" }); setOpen(true);
  }
  function openEdit(b: Bundle) {
    setEditingId(b.id); setForm({ name: b.name, sku: b.sku, price: b.price, image: b.image, description: b.description || "" });
    setFormItems(b.items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size || "" })));
    setNewItem({ productId: "", quantity: 1, size: "" }); setOpen(true);
  }
  function closeDialog() { setOpen(false) }

  const selectedProduct = products.find((p) => p.id === newItem.productId);

  function parseSizes(s: string | null): string[] {
    if (!s) return [];
    try { return JSON.parse(s) } catch { return [] }
  }

  function totalOriginal(items: BundleItem[]) {
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}` }

  // Min stock across all bundle items
  function bundleStock(b: Bundle): number {
    return Math.min(...b.items.map((i) => {
      if (i.product.isClothing && i.size) {
        const ss = (i.product as Product).sizeStocks?.find((s) => s.size === i.size);
        return Math.floor((ss?.stock ?? 0) / i.quantity);
      }
      return Math.floor(i.product.stock / i.quantity);
    }));
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bundling Produk</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Gabungkan beberapa produk jadi satu paket</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Bundling</Button>
      </div>

      <Card>
        {fetchLoading ? <TableSkeleton columns={7} /> : <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Foto</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Bundling</TableHead>
              <TableHead>Isi</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.image ? (
                    <Image src={b.image} alt={b.name} width={36} height={36} className="w-9 h-9 rounded object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><PackageOpen className="w-4 h-4 text-muted-foreground" /></div>
                  )}
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{b.sku}</Badge></TableCell>
                <TableCell>
                  <span className="font-medium">{b.name}</span>
                  <span className="text-xs text-muted-foreground block line-through">{formatRp(totalOriginal(b.items))}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {b.items.map((i) => (
                      <span key={i.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                        {i.quantity}x {i.product.name}{i.size ? ` (${i.size})` : ""}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatRp(b.price)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={bundleStock(b) > 0 ? "default" : "destructive"}>{bundleStock(b)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {bundles.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada bundling</TableCell></TableRow>}
          </TableBody>
        </Table>}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Bundling" : "Tambah Bundling Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image */}
            <div className="space-y-2">
              <Label>Foto Bundling</Label>
              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative">
                    <Image src={form.image} alt="Foto" width={64} height={64} className="w-16 h-16 rounded-lg object-cover border" />
                    <button type="button" onClick={() => setForm({ ...form, image: null })} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = "" }} />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Nama Bundling</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Paket Hemat A" autoFocus />
              </div>
              <div className="w-28 space-y-2">
                <Label>Kode</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} required placeholder="BDL001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Harga Bundling</Label>
              <CurrencyInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              {formItems.length >= 2 && (
                <p className="text-xs text-muted-foreground">
                  Harga satuan: {formatRp(formItems.reduce((s, i) => s + (products.find((p) => p.id === i.productId)?.price || 0) * i.quantity, 0))}
                  {form.price > 0 && ` → Hemat ${formatRp(formItems.reduce((s, i) => s + (products.find((p) => p.id === i.productId)?.price || 0) * i.quantity, 0) - form.price)}`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi bundling" />
            </div>

            {/* Bundle Items */}
            <div className="space-y-2">
              <Label>Isi Bundling</Label>
              {formItems.length > 0 && (
                <div className="space-y-1">
                  {formItems.map((item, idx) => {
                    const p = products.find((x) => x.id === item.productId);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2 text-sm">
                        <span>{item.quantity}x {p?.name || "?"}{item.size ? ` (${item.size})` : ""}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatRp((p?.price || 0) * item.quantity)}</span>
                          <button type="button" onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add item form */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select value={newItem.productId} onValueChange={(v) => v && setNewItem({ ...newItem, productId: v, size: "" })}>
                    <SelectTrigger className="w-full" size="sm">
                      <SelectValue placeholder="Pilih Produk">
                        {products.find((p) => p.id === newItem.productId)?.name || "Pilih Produk"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProduct?.isClothing && (
                  <Select value={newItem.size} onValueChange={(v) => v && setNewItem({ ...newItem, size: v })}>
                    <SelectTrigger className="w-20" size="sm">
                      <SelectValue placeholder="Size">{newItem.size || "Size"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {parseSizes(selectedProduct.sizes).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="w-16">
                  <NumberInput value={newItem.quantity} onChange={(v) => setNewItem({ ...newItem, quantity: v })} min={1} />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
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
