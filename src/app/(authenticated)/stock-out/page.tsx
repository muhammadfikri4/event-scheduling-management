"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, PackageMinus, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { TableSkeleton } from "@/components/table-skeleton";

interface SizeStock { size: string; stock: number }
interface Product { id: string; name: string; sku: string; unit: string; stock: number; image: string | null; isClothing: boolean; sizes: string | null; sizeStocks: SizeStock[] }
interface Transaction { id: string; productId: string; type: string; quantity: number; note: string | null; size: string | null; pic: string | null; createdByName: string | null; createdAt: string; product: Product }
interface Recap { date: string; count: number; totalQty: number; totalValue: number }

export default function StockOutPage() {
  const [tab, setTab] = useState<"list" | "recap">("list");
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recap, setRecap] = useState<Recap[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [form, setForm] = useState({ productId: "", quantity: 1, note: "", size: "", pic: "" });
  const [sizeQtys, setSizeQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()).then(setProducts),
      fetchTransactions(),
      fetchRecap(),
    ]).then(() => setFetchLoading(false));
  }, []);

  async function fetchTransactions() {
    setTransactions(await fetch("/api/stock-transactions?type=out").then((r) => r.json()));
  }
  async function fetchRecap() {
    setRecap(await fetch("/api/stock-transactions/recap?type=out").then((r) => r.json()));
  }

  const selectedProduct = products.find((p) => p.id === form.productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) { toast.error("Pilih produk"); return }
    if (!form.note.trim()) { toast.error("Catatan wajib diisi untuk barang keluar"); return }
    setLoading(true);
    try {
      if (selectedProduct?.isClothing) {
        const entries = Object.entries(sizeQtys).filter(([, qty]) => qty > 0);
        if (entries.length === 0) { toast.error("Isi jumlah minimal 1 ukuran"); setLoading(false); return }
        for (const [size, quantity] of entries) {
          const res = await fetch("/api/stock-transactions", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: form.productId, type: "out", quantity, size, note: form.note, pic: form.pic || null }),
          });
          if (!res.ok) { const err = await res.json(); toast.error(err.error || "Gagal menyimpan"); setLoading(false); return }
        }
      } else {
        const res = await fetch("/api/stock-transactions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: form.productId, type: "out", quantity: form.quantity, size: null, note: form.note, pic: form.pic || null }),
        });
        if (!res.ok) { const err = await res.json(); toast.error(err.error || "Gagal menyimpan"); setLoading(false); return }
      }
      toast.success("Barang keluar berhasil dicatat");
      setOpen(false); setForm({ productId: "", quantity: 1, note: "", size: "", pic: "" }); setSizeQtys({});
      fetchTransactions(); fetchRecap();
      fetch("/api/products").then((r) => r.json()).then(setProducts);
    } finally { setLoading(false) }
  }

  function parseSizes(s: string | null): string[] {
    if (!s) return [];
    try { return JSON.parse(s) } catch { return [] }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Barang Keluar</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Catat transaksi stok keluar</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border overflow-hidden">
            <button onClick={() => setTab("list")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Transaksi</button>
            <button onClick={() => setTab("recap")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "recap" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Rekap Harian</button>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Barang Keluar</Button>
        </div>
      </div>

      {tab === "list" ? (
        <Card>
          {fetchLoading ? <TableSkeleton columns={8} /> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Oleh</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground text-xs">{format(new Date(t.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t.product.image && <Image src={t.product.image} alt={t.product.name} width={28} height={28} className="w-7 h-7 rounded object-cover" />}
                      <span className="font-medium">{t.product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{t.product.sku}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-red-600">-{t.quantity} {t.product.unit}</TableCell>
                  <TableCell>{t.size ? <Badge variant="outline" className="text-xs">{t.size}</Badge> : "—"}</TableCell>
                  <TableCell className="text-sm">{t.pic || "—"}</TableCell>
                  <TableCell className="text-sm">{t.createdByName || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.note || "—"}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Belum ada transaksi keluar</TableCell></TableRow>}
            </TableBody>
          </Table>}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">{recap.reduce((s, r) => s + r.count, 0)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Item Keluar</p>
              <p className="text-2xl font-bold text-red-600">{recap.reduce((s, r) => s + r.totalQty, 0)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Nilai</p>
              <p className="text-2xl font-bold">Rp {recap.reduce((s, r) => s + r.totalValue, 0).toLocaleString("id-ID")}</p>
            </Card>
          </div>

          <Card>
            {fetchLoading ? <TableSkeleton columns={4} /> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Transaksi</TableHead>
                  <TableHead className="text-right">Item Keluar</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recap.map((r) => (
                  <TableRow key={r.date}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{format(new Date(r.date + "T00:00:00"), "EEEE, d MMM yyyy", { locale: localeId })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{r.count}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-red-600">-{r.totalQty}</TableCell>
                    <TableCell className="text-right font-semibold">Rp {r.totalValue.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))}
                {recap.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>}
              </TableBody>
            </Table>}
          </Card>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackageMinus className="w-4 h-4" /> Barang Keluar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Produk</Label>
              <Select value={form.productId} onValueChange={(v) => { if (v) { setForm({ ...form, productId: v, size: "" }); setSizeQtys({}) } }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Produk">
                    {(() => { const p = products.find((x) => x.id === form.productId); return p ? `${p.name} (${p.sku})` : "Pilih Produk" })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        {p.image && <Image src={p.image} alt={p.name} width={20} height={20} className="w-5 h-5 rounded object-cover" />}
                        <span>{p.name} ({p.sku}) · Stok: {p.stock} {p.unit}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct?.isClothing ? (
              <div className="space-y-2">
                <Label>Jumlah per Ukuran</Label>
                <div className="grid grid-cols-3 gap-2">
                  {parseSizes(selectedProduct.sizes).map((size) => {
                    const ss = selectedProduct.sizeStocks?.find((s) => s.size === size);
                    return (
                      <div key={size} className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">{size} <span className="opacity-60">(stok: {ss?.stock ?? 0})</span></span>
                        <NumberInput value={sizeQtys[size] || 0} onChange={(v) => setSizeQtys({ ...sizeQtys, [size]: v })} min={0} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <NumberInput value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} min={1} />
              </div>
            )}
            <div className="space-y-2">
              <Label>PIC (Penanggung Jawab)</Label>
              <Input value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })} placeholder="Nama PIC" />
            </div>
            <div className="space-y-2">
              <Label>Catatan <span className="text-destructive">*</span></Label>
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Wajib diisi" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
