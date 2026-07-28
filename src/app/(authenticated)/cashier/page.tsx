"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2, CheckCircle, Shirt, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/currency-input";
import { toast } from "sonner";
import Image from "next/image";
import { ReceiptView } from "@/components/receipt-view";

interface Product {
  id: string; name: string; sku: string; unit: string;
  stock: number; price: number; image: string | null;
  isClothing: boolean; sizes: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  size: string | null;
}

interface Sale {
  id: string; invoiceNumber: string; totalAmount: number;
  paidAmount: number; changeAmount: number;
  items: { product: Product; quantity: number; price: number; size: string | null; subtotal: number }[];
}

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchProducts() }, []);
  async function fetchProducts() { setProducts(await fetch("/api/products").then((r) => r.json())) }

  const filtered = products.filter((p) =>
    p.stock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToCart(product: Product, size: string | null = null) {
    setCart((prev) => {
      const key = `${product.id}-${size || ""}`;
      const existing = prev.find((c) => `${c.product.id}-${c.size || ""}` === key);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error("Stok tidak cukup"); return prev }
        return prev.map((c) => `${c.product.id}-${c.size || ""}` === key ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1, size }];
    });
  }

  function handleProductClick(product: Product) {
    if (product.isClothing && product.sizes) {
      setSizePickerProduct(product);
    } else {
      addToCart(product);
    }
  }

  function updateQty(index: number, delta: number) {
    setCart((prev) => {
      const item = prev[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      if (newQty > item.product.stock) { toast.error("Stok tidak cukup"); return prev }
      return prev.map((c, i) => i === index ? { ...c, quantity: newQty } : c);
    });
  }

  function removeItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function openCheckout() {
    if (cart.length === 0) { toast.error("Keranjang kosong"); return }
    setPaidAmount(total);
    setNote("");
    setCheckoutOpen(true);
  }

  async function handleCheckout() {
    if (paidAmount < total) { toast.error("Pembayaran kurang"); return }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            price: c.product.price,
            size: c.size,
          })),
          paidAmount,
          note: note || undefined,
        }),
      });
      if (res.ok) {
        const sale = await res.json();
        setLastSale(sale);
        setCart([]);
        setCheckoutOpen(false);
        setSuccessOpen(true);
        fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal checkout");
      }
    } finally { setLoading(false) }
  }

  function parseSizes(s: string | null): string[] {
    if (!s) return [];
    try { return JSON.parse(s) } catch { return [] }
  }

  function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}` }

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
      </style></head>
      <body class="p-4">${receiptRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close() };
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* LEFT — Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b space-y-3">
          <h1 className="text-lg font-semibold">Kasir</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => handleProductClick(p)}
                className="text-left rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden">
                {p.image ? (
                  <Image src={p.image} alt={p.name} width={200} height={150} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-muted flex items-center justify-center">
                    {p.isClothing ? <Shirt className="w-8 h-8 text-muted-foreground/30" /> : <span className="text-2xl font-bold text-muted-foreground/20">{p.sku.slice(0, 3)}</span>}
                  </div>
                )}
                <div className="p-2.5">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-primary font-bold text-sm mt-0.5">{formatRp(p.price)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Stok: {p.stock}</span>
                    {p.isClothing && <Shirt className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                {search ? "Produk tidak ditemukan" : "Tidak ada produk tersedia"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l flex flex-col bg-background">
        <div className="p-4 border-b flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Keranjang</h2>
          {cart.length > 0 && <Badge variant="secondary" className="text-xs ml-auto">{cart.length} item</Badge>}
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 text-sm">Belum ada item</div>
          ) : (
            cart.map((item, i) => (
              <Card key={`${item.product.id}-${item.size}`} className="p-3">
                <div className="flex gap-2">
                  {item.product.image ? (
                    <Image src={item.product.image} alt={item.product.name} width={44} height={44} className="w-11 h-11 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">{item.product.sku.slice(0, 3)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">{formatRp(item.product.price)}</p>
                      {item.size && <Badge variant="outline" className="text-[10px] h-4">{item.size}</Badge>}
                    </div>
                  </div>
                  <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateQty(i, -1)} className="px-2 py-1 hover:bg-accent transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(i, 1)} className="px-2 py-1 hover:bg-accent transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="font-semibold text-sm">{formatRp(item.product.price * item.quantity)}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold">{formatRp(total)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={openCheckout} disabled={cart.length === 0}>
            Bayar
          </Button>
        </div>
      </div>

      {/* Size Picker Dialog */}
      <Dialog open={!!sizePickerProduct} onOpenChange={() => setSizePickerProduct(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Pilih Ukuran</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {sizePickerProduct && parseSizes(sizePickerProduct.sizes).map((size) => (
              <button key={size} onClick={() => { addToCart(sizePickerProduct, size); setSizePickerProduct(null) }}
                className="px-5 py-3 rounded-lg border-2 text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-colors">
                {size}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Pembayaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Total Bayar</p>
              <p className="text-3xl font-bold">{formatRp(total)}</p>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Dibayar</Label>
              <CurrencyInput value={paidAmount} onChange={setPaidAmount} />
            </div>
            {paidAmount >= total && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <span className="text-sm">Kembalian</span>
                <span className="font-bold text-green-600">{formatRp(paidAmount - total)}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan transaksi" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCheckoutOpen(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleCheckout} disabled={loading || paidAmount < total}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Proses Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog — preview receipt */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Transaksi Berhasil
            </DialogTitle>
          </DialogHeader>

          {/* Receipt Preview */}
          <div className="border rounded-lg overflow-hidden bg-white max-h-[60vh] overflow-y-auto">
            {lastSale && <ReceiptView ref={receiptRef} sale={lastSale} />}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setSuccessOpen(false)}>Transaksi Baru</Button>
            <Button className="flex-1" onClick={handlePrint}><Printer className="w-4 h-4" /> Cetak Nota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
