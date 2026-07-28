"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiptView } from "@/components/receipt-view";

interface Product { id: string; name: string; sku: string }
interface SaleItem { id: string; productId: string; quantity: number; price: number; size: string | null; subtotal: number; product: Product }
interface Sale {
  id: string; invoiceNumber: string; totalAmount: number;
  paidAmount: number; changeAmount: number; note: string | null;
  createdBy: string; createdAt: string; items: SaleItem[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [detail, setDetail] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSales() }, []);
  async function fetchSales() {
    const res = await fetch("/api/sales").then((r) => r.json());
    setSales(res.data || []);
  }

  function handlePrint() {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak Nota</title>
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
          .py-1 { padding: 2px 0; }
          .mb-2 { margin-bottom: 8px; }
          .text-sm { font-size: 12px; }
          .text-xs { font-size: 11px; }
          .text-10 { font-size: 10px; }
          .p-4 { padding: 8px; }
        </style>
      </head>
      <body class="p-4">${receiptRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close() };
  }

  function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}` }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold">Riwayat Penjualan</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">Histori transaksi penjualan</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-center">Item</TableHead>
              <TableHead className="text-right">Total</TableHead>
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
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(s)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetail(s); setShowReceipt(true) }}><Printer className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada transaksi</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

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
                        {item.product.name}
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
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">{formatRp(detail.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bayar</span><span>{formatRp(detail.paidAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kembali</span><span className="text-green-600 font-medium">{formatRp(detail.changeAmount)}</span></div>
              </div>

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
