"use client";

import { forwardRef } from "react";

interface ReceiptItem {
  product: { name: string; sku: string };
  quantity: number;
  price: number;
  size: string | null;
  subtotal: number;
}

interface ReceiptData {
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  note: string | null;
  createdAt: string;
  items: ReceiptItem[];
}

export const ReceiptView = forwardRef<HTMLDivElement, { sale: ReceiptData }>(
  function ReceiptView({ sale }, ref) {
    const date = new Date(sale.createdAt);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return (
      <div ref={ref} className="receipt-content bg-white text-black p-4 font-mono text-[11px] leading-snug" style={{ width: "80mm" }}>
        <div className="text-center mb-2">
          <p className="font-bold text-sm">NOTA PENJUALAN</p>
          <p className="text-[10px]">{sale.invoiceNumber}</p>
          <p className="text-[10px]">{dateStr}</p>
        </div>

        <div className="border-t border-dashed border-black my-1" />

        <table className="w-full">
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td className="py-0.5 align-top">
                  <span>{item.product.name}</span>
                  {item.size && <span className="ml-1">({item.size})</span>}
                  <br />
                  <span className="text-[10px]">{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</span>
                </td>
                <td className="py-0.5 text-right align-top whitespace-nowrap">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between font-bold text-xs">
          <span>TOTAL</span>
          <span>Rp {sale.totalAmount.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar</span>
          <span>Rp {sale.paidAmount.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>Rp {sale.changeAmount.toLocaleString("id-ID")}</span>
        </div>

        {sale.note && (
          <>
            <div className="border-t border-dashed border-black my-1" />
            <p className="text-[10px]">Catatan: {sale.note}</p>
          </>
        )}

        <div className="border-t border-dashed border-black my-1" />
        <p className="text-center text-[10px]">Terima Kasih!</p>
      </div>
    );
  }
);
