"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2, CheckCircle, Shirt, Printer, PackageOpen } from "lucide-react";
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
import { usePrinter } from "@/lib/printer";

interface SizeStock { size: string; stock: number }
interface Product {
  id: string; name: string; sku: string; unit: string;
  stock: number; price: number; image: string | null;
  isClothing: boolean; sizes: string | null;
  sizeStocks: SizeStock[];
}

interface BundleItem { id: string; productId: string; quantity: number; size: string | null; product: Product }
interface Bundle { id: string; name: string; sku: string; price: number; image: string | null; items: BundleItem[] }

interface CartItem {
  product: Product;
  quantity: number;
  size: string | null;
  bundle?: Bundle; // if this cart item came from a bundle
}

interface Sale {
  id: string; invoiceNumber: string;
  subtotalAmount: number; discountType: string | null; discountValue: number; discountAmount: number;
  totalAmount: number; paidAmount: number; changeAmount: number;
  customerName: string | null; cashierName: string | null; note: string | null;
  createdAt: string;
  items: { product: Product | null; bundle: { name: string; sku: string } | null; quantity: number; price: number; size: string | null; subtotal: number }[];
}

export default function CashierPage() {
  const printer = usePrinter();
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"products" | "bundles">("products");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "nominal">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchProducts(); fetchBundles() }, []);
  async function fetchProducts() { setProducts(await fetch("/api/products").then((r) => r.json())) }
  async function fetchBundles() { setBundles(await fetch("/api/bundles").then((r) => r.json())) }

  const filtered = products.filter((p) =>
    p.stock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredBundles = bundles.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.sku.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function getAvailableStock(product: Product, size: string | null): number {
    if (product.isClothing && size) {
      return product.sizeStocks?.find((s) => s.size === size)?.stock ?? 0;
    }
    return product.stock;
  }

  function addToCart(product: Product, size: string | null = null) {
    setCart((prev) => {
      const key = `${product.id}-${size || ""}`;
      const existing = prev.find((c) => `${c.product.id}-${c.size || ""}` === key);
      const maxStock = getAvailableStock(product, size);
      if (existing) {
        if (existing.quantity >= maxStock) { toast.error("Stok tidak cukup"); return prev }
        return prev.map((c) => `${c.product.id}-${c.size || ""}` === key ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1, size }];
    });
  }

  function handleProductClick(product: Product) {
    if (product.isClothing && product.sizes) {
      setSizePickerProduct(product);
      setSelectedSizes([]);
    } else {
      addToCart(product);
    }
  }

  function addBundleToCart(bundle: Bundle) {
    // Check stock for all bundle items
    for (const bi of bundle.items) {
      const avail = getAvailableStock(bi.product, bi.size);
      if (avail < bi.quantity) {
        toast.error(`Stok ${bi.product.name}${bi.size ? ` (${bi.size})` : ""} tidak cukup`);
        return;
      }
    }
    // Add bundle as a single cart item using a virtual product
    setCart((prev) => {
      const key = `bundle-${bundle.id}`;
      const existing = prev.find((c) => c.bundle?.id === bundle.id);
      if (existing) {
        // Check stock for all items * (qty+1)
        const newQty = existing.quantity + 1;
        for (const bi of bundle.items) {
          const avail = getAvailableStock(bi.product, bi.size);
          if (avail < bi.quantity * newQty) {
            toast.error(`Stok ${bi.product.name} tidak cukup untuk ${newQty} bundling`);
            return prev;
          }
        }
        return prev.map((c) => c.bundle?.id === bundle.id ? { ...c, quantity: newQty } : c);
      }
      return [...prev, {
        product: { id: key, name: bundle.name, sku: bundle.sku, unit: "paket", stock: 999, price: bundle.price, image: bundle.image, isClothing: false, sizes: null, sizeStocks: [] },
        quantity: 1,
        size: null,
        bundle,
      }];
    });
  }

  function updateQty(index: number, delta: number) {
    setCart((prev) => {
      const item = prev[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const maxStock = getAvailableStock(item.product, item.size);
      if (newQty > maxStock) { toast.error("Stok tidak cukup"); return prev }
      return prev.map((c, i) => i === index ? { ...c, quantity: newQty } : c);
    });
  }

  function removeItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const discountAmount = discountType === "percent"
    ? Math.round(total * discountValue / 100)
    : discountValue;
  const finalTotal = Math.max(0, total - (discountValue > 0 ? discountAmount : 0));

  function openCheckout() {
    if (cart.length === 0) { toast.error("Keranjang kosong"); return }
    setPaidAmount(0);
    setNote("");
    setCustomerName("");
    setDiscountType("percent");
    setDiscountValue(0);
    setCheckoutOpen(true);
  }

  async function handleCheckout() {
    if (paidAmount < finalTotal) { toast.error("Pembayaran kurang"); return }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.filter((c) => !c.bundle).map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            price: c.product.price,
            size: c.size,
          })),
          bundles: cart.filter((c) => c.bundle).map((c) => ({
            bundleId: c.bundle!.id,
            quantity: c.quantity,
            price: c.bundle!.price,
          })),
          paidAmount,
          note: note || undefined,
          customerName: customerName || undefined,
          discountType: discountValue > 0 ? discountType : undefined,
          discountValue: discountValue > 0 ? discountValue : undefined,
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

  async function handlePrint() {
    // If device printer connected, send ESC/POS directly
    if (printer.status === "connected" && lastSale) {
      try {
        const enc = new TextEncoder();
        const lines: (Uint8Array | string)[] = [];

        lines.push(new Uint8Array([0x1B, 0x40]));                 // initialize
        lines.push(new Uint8Array([0x1B, 0x61, 0x01]));           // center
        lines.push(new Uint8Array([0x1B, 0x45, 0x01]));           // bold on
        lines.push("NOTA PENJUALAN\n");
        lines.push(new Uint8Array([0x1B, 0x45, 0x00]));           // bold off
        lines.push(`${lastSale.invoiceNumber}\n`);
        lines.push(`${new Date(lastSale.createdAt).toLocaleString("id-ID")}\n`);
        lines.push("KWITANSI BUKTI PEMBAYARAN\n");
        lines.push(new Uint8Array([0x1B, 0x45, 0x00]));           // bold off
        lines.push(`${lastSale.invoiceNumber}\n`);
        lines.push(`${new Date(lastSale.createdAt).toLocaleString("id-ID")}\n`);
        if (lastSale.customerName) lines.push(`Pembeli: ${lastSale.customerName}\n`);
        lines.push("================================\n");
        lines.push(new Uint8Array([0x1B, 0x61, 0x00]));           // left align

        for (const item of lastSale.items) {
          const name = (item.bundle?.name || item.product?.name || "—") + (item.size ? ` (${item.size})` : "");
          lines.push(`${name}\n`);
          lines.push(`  ${item.quantity} x Rp ${item.price.toLocaleString("id-ID")}`.padEnd(18) + `Rp ${item.subtotal.toLocaleString("id-ID")}\n`);
        }

        lines.push("--------------------------------\n");
        lines.push(`Sub Total`.padEnd(18) + `Rp ${lastSale.subtotalAmount.toLocaleString("id-ID")}\n`);
        if (lastSale.discountAmount > 0) {
          const discLabel = lastSale.discountType === "percent" ? `Diskon (${lastSale.discountValue}%)` : "Diskon";
          lines.push(`${discLabel}`.padEnd(18) + `-Rp ${lastSale.discountAmount.toLocaleString("id-ID")}\n`);
        }
        lines.push(new Uint8Array([0x1B, 0x45, 0x01]));           // bold
        lines.push(`TOTAL`.padEnd(18) + `Rp ${lastSale.totalAmount.toLocaleString("id-ID")}\n`);
        lines.push(new Uint8Array([0x1B, 0x45, 0x00]));           // bold off
        lines.push(`Bayar`.padEnd(18) + `Rp ${lastSale.paidAmount.toLocaleString("id-ID")}\n`);
        lines.push(`Kembali`.padEnd(18) + `Rp ${lastSale.changeAmount.toLocaleString("id-ID")}\n`);

        lines.push("--------------------------------\n");
        if (lastSale.cashierName) lines.push(`Kasir: ${lastSale.cashierName}\n`);
        if (lastSale.note) lines.push(`Catatan: ${lastSale.note}\n`);

        lines.push("================================\n");
        lines.push(new Uint8Array([0x1B, 0x61, 0x01]));           // center
        lines.push("Terima kasih atas kunjungan Anda!\n\n\n\n");
        lines.push(new Uint8Array([0x1D, 0x56, 0x00]));           // cut

        // Merge all into single Uint8Array
        const parts = lines.map((l) => typeof l === "string" ? enc.encode(l) : l);
        const total = parts.reduce((s, p) => s + p.length, 0);
        const data = new Uint8Array(total);
        let offset = 0;
        for (const p of parts) { data.set(p, offset); offset += p.length; }

        await printer.print(data);
        toast.success("Nota berhasil dicetak!");
        return;
      } catch {
        toast.error("Gagal cetak ke printer, menggunakan print dialog");
      }
    }

    // Fallback: window.print
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Cetak Nota</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; font-size: 10px; width: 57mm; }
        @page { size: 57mm auto; margin: 0; }
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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* LEFT — Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Kasir</h1>
            <div className="inline-flex rounded-md border overflow-hidden">
              <button onClick={() => setTab("products")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Produk</button>
              <button onClick={() => setTab("bundles")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === "bundles" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>Bundling</button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={tab === "products" ? "Cari produk..." : "Cari bundling..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {tab === "products" ? (
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
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredBundles.map((b) => (
                <button key={b.id} onClick={() => addBundleToCart(b)}
                  className="text-left rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden">
                  {b.image ? (
                    <Image src={b.image} alt={b.name} width={200} height={150} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-muted flex items-center justify-center">
                      <PackageOpen className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="font-medium text-sm truncate">{b.name}</p>
                    <p className="text-primary font-bold text-sm mt-0.5">{formatRp(b.price)}</p>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {b.items.map((bi) => (
                        <span key={bi.id} className="text-[9px] bg-muted px-1 py-0.5 rounded">
                          {bi.quantity}x {bi.product.name}{bi.size ? ` (${bi.size})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
              {filteredBundles.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  {search ? "Bundling tidak ditemukan" : "Belum ada bundling"}
                </div>
              )}
            </div>
          )}
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

      {/* Size Picker Dialog — multi-select */}
      <Dialog open={!!sizePickerProduct} onOpenChange={() => setSizePickerProduct(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Pilih Ukuran</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {sizePickerProduct && parseSizes(sizePickerProduct.sizes).map((size) => {
              const ss = sizePickerProduct.sizeStocks?.find((s) => s.size === size);
              const sizeStock = ss?.stock ?? 0;
              const selected = selectedSizes.includes(size);
              return (
                <button key={size}
                  onClick={() => {
                    if (sizeStock <= 0) return;
                    setSelectedSizes((prev) => selected ? prev.filter((s) => s !== size) : [...prev, size]);
                  }}
                  disabled={sizeStock <= 0}
                  className={`px-5 py-3 rounded-lg border-2 text-sm font-semibold transition-colors ${sizeStock <= 0 ? "opacity-30 cursor-not-allowed" : selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:bg-primary/5"}`}>
                  {size} <span className="text-xs opacity-60">({sizeStock})</span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={selectedSizes.length === 0}
              onClick={() => {
                if (sizePickerProduct) {
                  for (const size of selectedSizes) { addToCart(sizePickerProduct, size) }
                  setSizePickerProduct(null);
                  setSelectedSizes([]);
                }
              }}
            >
              Tambahkan {selectedSizes.length > 0 ? `(${selectedSizes.length} ukuran)` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Pembayaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label>Nama Pembeli (opsional)</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama pembeli" />
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sub Total</span>
              <span className="font-semibold">{formatRp(total)}</span>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label>Diskon (opsional)</Label>
              <div className="flex gap-2">
                <div className="inline-flex rounded-md border overflow-hidden shrink-0">
                  <button type="button" onClick={() => setDiscountType("percent")}
                    className={`px-3 py-1.5 text-xs font-medium ${discountType === "percent" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                    %
                  </button>
                  <button type="button" onClick={() => setDiscountType("nominal")}
                    className={`px-3 py-1.5 text-xs font-medium ${discountType === "nominal" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                    Rp
                  </button>
                </div>
                {discountType === "nominal" ? (
                  <CurrencyInput value={discountValue} onChange={setDiscountValue} />
                ) : (
                  <Input type="number" min={0} max={100} value={discountValue || ""} onChange={(e) => setDiscountValue(Number(e.target.value))} placeholder="0" />
                )}
              </div>
              {discountValue > 0 && (
                <p className="text-xs text-muted-foreground">
                  Potongan: -{formatRp(discountAmount)} {discountType === "percent" && `(${discountValue}%)`}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="text-center py-2 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Bayar</p>
              <p className="text-3xl font-bold">{formatRp(finalTotal)}</p>
            </div>

            {/* Paid */}
            <div className="space-y-2">
              <Label>Jumlah Dibayar</Label>
              <CurrencyInput value={paidAmount} onChange={setPaidAmount} />
            </div>
            {paidAmount >= finalTotal && paidAmount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <span className="text-sm">Kembalian</span>
                <span className="font-bold text-green-600">{formatRp(paidAmount - finalTotal)}</span>
              </div>
            )}

            {/* Note */}
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan transaksi" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCheckoutOpen(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleCheckout} disabled={loading || paidAmount < finalTotal}>
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
            <Button className="flex-1" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              {printer.status === "connected" ? `Cetak (${printer.device?.name})` : "Cetak Nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
