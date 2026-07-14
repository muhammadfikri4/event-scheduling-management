"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, PackagePlus } from "lucide-react";
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

interface Product { id: string; name: string; sku: string; unit: string; stock: number }
interface Transaction { id: string; productId: string; type: string; quantity: number; note: string | null; createdAt: string; product: Product }

export default function StockInPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ productId: "", quantity: 1, note: "" });

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setTransactions(await fetch("/api/stock-transactions?type=in").then((r) => r.json()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) { toast.error("Pilih produk"); return }
    setLoading(true);
    try {
      const res = await fetch("/api/stock-transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "in" }),
      });
      if (res.ok) {
        toast.success("Barang masuk berhasil dicatat");
        setOpen(false); setForm({ productId: "", quantity: 1, note: "" });
        fetchTransactions();
        fetch("/api/products").then((r) => r.json()).then(setProducts);
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Barang Masuk</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Catat transaksi stok masuk</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Barang Masuk</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-muted-foreground text-xs">{format(new Date(t.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}</TableCell>
                <TableCell className="font-medium">{t.product.name}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{t.product.sku}</Badge></TableCell>
                <TableCell className="text-right font-semibold text-green-600">+{t.quantity} {t.product.unit}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.note || "—"}</TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada transaksi masuk</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackagePlus className="w-4 h-4" /> Barang Masuk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Produk</Label>
              <Select value={form.productId} onValueChange={(v) => v && setForm({ ...form, productId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Produk">
                    {(() => { const p = products.find((x) => x.id === form.productId); return p ? `${p.name} (${p.sku})` : "Pilih Produk" })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku}) · Stok: {p.stock} {p.unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <NumberInput value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} min={1} />
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Opsional" />
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
