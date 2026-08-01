"use client";

import { forwardRef } from "react";

interface ReceiptItem {
  product: { name: string; sku: string } | null;
  bundle: { name: string; sku: string } | null;
  quantity: number;
  price: number;
  size: string | null;
  subtotal: number;
}

export interface ReceiptData {
  invoiceNumber: string;
  subtotalAmount: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  customerName: string | null;
  cashierName: string | null;
  note: string | null;
  createdAt: string;
  items: ReceiptItem[];
}

const GREETINGS = [
  "Terima kasih atas kunjungan Anda! Semoga hari Anda menyenangkan.",
  "Terima kasih telah berbelanja! Sampai jumpa kembali.",
  "Terima kasih! Kepuasan Anda adalah prioritas kami.",
  "Terima kasih atas kepercayaan Anda! Salam hangat dari kami.",
  "Terima kasih! Semoga produk kami bermanfaat untuk Anda.",
  "Terima kasih telah mendukung IMERC 2026! Salam safety.",
];

function getGreeting(invoice: string): string {
  let hash = 0;
  for (let i = 0; i < invoice.length; i++) hash = ((hash << 5) - hash + invoice.charCodeAt(i)) | 0;
  return GREETINGS[Math.abs(hash) % GREETINGS.length];
}

function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}` }

function formatDiscount(type: string | null, value: number): string {
  if (type === "percent") return `Diskon (${value}%)`;
  return "Diskon";
}

export const ReceiptView = forwardRef<HTMLDivElement, { sale: ReceiptData }>(
  function ReceiptView({ sale }, ref) {
    const date = new Date(sale.createdAt);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return (
      <div ref={ref} className="receipt-content bg-white text-black p-4 font-mono text-[11px] leading-snug mx-auto" style={{ width: "80mm" }}>
        {/* 1. Logo IMERC */}
        <div className="text-center mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={process.env.NEXT_PUBLIC_LOGO || "/imerc-logo.png"} alt="IMERC" className="h-10 mx-auto mb-1" />
        </div>

        {/* 4. Alamat GRN */}
        <div className="text-center text-[9px] mb-2">
          <p>Indonesia Mining Emergency Response Community</p>
          <p>{process.env.NEXT_PUBLIC_RECEIPT_ADDRESS || "GRN - Graha Rescue Nusantara"}</p>
        </div>

        <div className="border-t border-dashed border-black my-1" />

        {/* 8. Kwitansi Bukti Pembayaran */}
        <div className="text-center mb-1">
          <p className="font-bold text-xs">KWITANSI BUKTI PEMBAYARAN</p>
          <p className="text-[10px]">{sale.invoiceNumber}</p>
          <p className="text-[10px]">{dateStr}</p>
        </div>

        {/* Kasir & Pembeli */}
        {sale.cashierName && (
          <p className="text-[10px]">Kasir: {sale.cashierName}</p>
        )}
        {sale.customerName && (
          <p className="text-[10px]">Pembeli: {sale.customerName}</p>
        )}

        <div className="border-t border-dashed border-black my-1" />

        {/* Items */}
        <table className="w-full">
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td className="py-0.5 align-top">
                  <span>{item.bundle?.name || item.product?.name || "—"}</span>
                  {item.size && <span className="ml-1">({item.size})</span>}
                  <br />
                  <span className="text-[10px]">{item.quantity} x {formatRp(item.price)}</span>
                </td>
                <td className="py-0.5 text-right align-top whitespace-nowrap">
                  {formatRp(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black my-1" />

        {/* 9. Sub Total - Diskon - Total - Bayar - Kembali */}
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>{formatRp(sale.subtotalAmount)}</span>
          </div>

          {/* 5. Diskon */}
          {sale.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>{formatDiscount(sale.discountType, sale.discountValue)}</span>
              <span>-{formatRp(sale.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-xs">
            <span>TOTAL</span>
            <span>{formatRp(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bayar</span>
            <span>{formatRp(sale.paidAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali</span>
            <span>{formatRp(sale.changeAmount)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-1" />

        {sale.note && (
          <p className="text-[10px]">Catatan: {sale.note}</p>
        )}

        <div className="border-t border-dashed border-black my-1" />

        <p className="text-center text-[10px] font-bold my-1">ELEVATE INDONESIAN RESCUER</p>

        {/* 6. Ucapan terima kasih */}
        <p className="text-center text-[10px] italic my-1">
          {getGreeting(sale.invoiceNumber)}
        </p>

        {/* 7. QR Code menuju website GRN */}
        <div className="text-center mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(process.env.NEXT_PUBLIC_RECEIPT_WEBSITE || "https://grfrn.com")}`}
            alt="QR"
            className="w-20 h-20 mx-auto"
          />
          <p className="text-[9px] mt-0.5">{(process.env.NEXT_PUBLIC_RECEIPT_WEBSITE || "https://grfrn.com").replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
    );
  }
);
