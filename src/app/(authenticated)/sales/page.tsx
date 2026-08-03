"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, Printer, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiptView } from "@/components/receipt-view";
import { TableSkeleton } from "@/components/table-skeleton";

interface Product { id: string; name: string; sku: string }
interface BundleRef { id: string; name: string; sku: string }
interface SaleItem { id: string; productId: string | null; bundleId: string | null; quantity: number; price: number; size: string | null; subtotal: number; product: Product | null; bundle: BundleRef | null }
interface Sale {
  id: string; invoiceNumber: string;
  subtotalAmount: number; discountType: string | null; discountValue: number; discountAmount: number;
  totalAmount: number; paidAmount: number; changeAmount: number;
  customerName: string | null; cashierName: string | null; note: string | null;
  createdBy: string; createdAt: string; items: SaleItem[];
}
interface Recap { date: string; count: number; subtotal: number; discount: number; total: number }

export default function SalesPage() {
  const [tab, setTab] = useState<"list" | "recap">("list");
  const [sales, setSales] = useState<Sale[]>([]);
  const [recap, setRecap] = useState<Recap[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [detail, setDetail] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { Promise.all([fetchSales(), fetchRecap()]).then(() => setFetchLoading(false)) }, []);
  async function fetchSales() {
    const res = await fetch("/api/sales").then((r) => r.json());
    setSales(res.data || []);
  }
  async function fetchRecap() {
    setRecap(await fetch("/api/sales/recap").then((r) => r.json()));
  }

  function handlePrint() {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Cetak Nota</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; font-size: 11px; width: 80mm; }
        @page { size: 80mm auto; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .border-dashed { border-top: 1px dashed #000; margin: 4px 0; }
        .flex { display: flex; justify-content: space-between; }
        .p-4 { padding: 8px; }
        img { max-width: 100%; height: auto; }
        .h-10 { height: 40px; width: auto; }
        .w-20 { width: 80px; height: 80px; }
        .mx-auto { margin-left: auto; margin-right: auto; display: block; }
        .mb-1 { margin-bottom: 4px; }
        .mt-2 { margin-top: 8px; }
        .my-1 { margin: 4px 0; }
        .italic { font-style: italic; }
      </style></head>
      <body class="p-4">${receiptRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close() };
  }

  function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}` }

  const recapTotal = recap.reduce((s, r) => ({ count: s.count + r.count, total: s.total + r.total }), { count: 0, total: 0 });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Riwayat Penjualan</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Histori transaksi penjualan</p>
        </div>
        <div className="inline-flex rounded-md border overflow-hidden">
          <button onClick={() => setTab("list")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Transaksi</button>
          <button onClick={() => setTab("recap")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "recap" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Rekap Harian</button>
        </div>
      </div>

      {tab === "list" ? (
        <Card>
          {fetchLoading ? <TableSkeleton columns={6} /> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-center">Item</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead className="text-right w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{s.invoiceNumber}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(s.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}</TableCell>
                  <TableCell className="text-center">{s.items.length}</TableCell>
                  <TableCell className="text-right font-semibold">{formatRp(s.totalAmount)}</TableCell>
                  <TableCell className="text-sm">{s.cashierName || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(s)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetail(s); setShowReceipt(true) }}><Printer className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada transaksi</TableCell></TableRow>}
            </TableBody>
          </Table>}
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">{recapTotal.count}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="text-2xl font-bold">{formatRp(recapTotal.total)}</p>
            </Card>
          </div>

          <Card>
            {fetchLoading ? <TableSkeleton columns={6} /> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Transaksi</TableHead>
                  <TableHead className="text-right">Sub Total</TableHead>
                  <TableHead className="text-right">Diskon</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                    <TableCell className="text-right">{formatRp(r.subtotal)}</TableCell>
                    <TableCell className="text-right text-red-500">{r.discount > 0 ? `-${formatRp(r.discount)}` : "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{formatRp(r.total)}</TableCell>
                  </TableRow>
                ))}
                {recap.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>}
              </TableBody>
            </Table>}
          </Card>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail && !showReceipt} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Detail Penjualan</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Invoice</p>
                  <p className="font-mono font-medium">{detail.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tanggal</p>
                  <p>{format(new Date(detail.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.bundle?.name || item.product?.name || "—"}
                        {item.size && <Badge variant="outline" className="ml-1 text-[10px]">{item.size}</Badge>}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatRp(item.price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatRp(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>{formatRp(detail.subtotalAmount)}</span></div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{detail.discountType === "percent" ? `Diskon (${detail.discountValue}%)` : "Diskon"}</span><span className="text-red-500">-{formatRp(detail.discountAmount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">{formatRp(detail.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bayar</span><span>{formatRp(detail.paidAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kembali</span><span className="text-green-600 font-medium">{formatRp(detail.changeAmount)}</span></div>
              </div>

              {(detail.customerName || detail.cashierName) && (
                <div className="space-y-1 pt-2 border-t text-xs">
                  {detail.cashierName && <p className="text-muted-foreground">Kasir: {detail.cashierName}</p>}
                  {detail.customerName && <p className="text-muted-foreground">Pembeli: {detail.customerName}</p>}
                </div>
              )}

              {detail.note && (
                <p className="text-xs text-muted-foreground border-t pt-2">Catatan: {detail.note}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Print Dialog */}
      <Dialog open={showReceipt} onOpenChange={() => { setShowReceipt(false); setDetail(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Cetak Nota</span>
              <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4" /> Cetak</Button>
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden flex justify-center bg-gray-50">
            {detail && <ReceiptView ref={receiptRef} sale={detail} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
