"use client";

import { Usb, Bluetooth, Unplug, Printer, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrinter } from "@/lib/printer";
import { toast } from "sonner";

export default function PrinterPage() {
  const { device, status, connectUSB, connectBluetooth, disconnect, print, isSupported } = usePrinter();

  async function handleTestPrint() {
    try {
      const encoder = new TextEncoder();
      const commands = new Uint8Array([
        // ESC @ — initialize
        0x1B, 0x40,
        // ESC a 1 — center align
        0x1B, 0x61, 0x01,
        // ESC E 1 — bold on
        0x1B, 0x45, 0x01,
      ]);
      const text = encoder.encode("TEST PRINT\n");
      const boldOff = new Uint8Array([0x1B, 0x45, 0x00]);
      const line = encoder.encode("================================\n");
      const body = encoder.encode("Printer berhasil terhubung!\n");
      const date = encoder.encode(`${new Date().toLocaleString("id-ID")}\n`);
      const footer = encoder.encode("\n\n\n");
      // GS V 0 — full cut
      const cut = new Uint8Array([0x1D, 0x56, 0x00]);

      const data = new Uint8Array([
        ...commands, ...text, ...boldOff, ...line, ...body, ...date, ...line, ...footer, ...cut,
      ]);

      await print(data);
      toast.success("Test print berhasil!");
    } catch {
      toast.error("Gagal test print");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Pengaturan Printer</h1>
        <p className="text-sm text-muted-foreground">Hubungkan printer thermal untuk cetak nota</p>
      </div>

      {/* Status Card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status === "connected" ? "bg-green-100 dark:bg-green-950/50" : status === "connecting" ? "bg-yellow-100 dark:bg-yellow-950/50" : "bg-muted"}`}>
            {status === "connected" ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : status === "connecting" ? (
              <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
            ) : (
              <XCircle className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {status === "connected" ? device?.name : status === "connecting" ? "Menghubungkan..." : "Tidak terhubung"}
              </p>
              {status === "connected" && (
                <Badge variant="outline" className="text-xs">
                  {device?.type === "serial" ? "USB" : "Bluetooth"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status === "connected"
                ? "Printer siap digunakan untuk cetak nota"
                : "Hubungkan printer untuk mulai mencetak"}
            </p>
          </div>
          {status === "connected" && (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Unplug className="w-4 h-4" /> Putuskan
            </Button>
          )}
        </div>
      </Card>

      {/* Connect Options */}
      {status !== "connected" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* USB */}
          <Card className={`p-5 ${!isSupported.serial ? "opacity-50" : "cursor-pointer hover:shadow-md transition-shadow"}`}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                <Usb className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">USB (Kabel)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Colok printer via kabel USB</p>
              </div>
              <Button
                className="w-full"
                onClick={connectUSB}
                disabled={!isSupported.serial || status === "connecting"}
              >
                {status === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
                Hubungkan USB
              </Button>
              {!isSupported.serial && (
                <p className="text-[10px] text-destructive">Browser tidak mendukung Web Serial. Gunakan Chrome.</p>
              )}
            </div>
          </Card>

          {/* Bluetooth */}
          <Card className={`p-5 ${!isSupported.bluetooth ? "opacity-50" : "cursor-pointer hover:shadow-md transition-shadow"}`}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                <Bluetooth className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold">Bluetooth</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cari printer Bluetooth terdekat</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={connectBluetooth}
                disabled={!isSupported.bluetooth || status === "connecting"}
              >
                {status === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />}
                Cari Bluetooth
              </Button>
              {!isSupported.bluetooth && (
                <p className="text-[10px] text-destructive">Browser tidak mendukung Web Bluetooth. Gunakan Chrome.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Test Print */}
      {status === "connected" && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Test Print</p>
              <p className="text-xs text-muted-foreground">Cetak halaman tes untuk memastikan printer berfungsi</p>
            </div>
            <Button variant="outline" onClick={handleTestPrint}>
              <Printer className="w-4 h-4" /> Test Print
            </Button>
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>* Fitur ini memerlukan browser <strong>Google Chrome</strong> versi 89+</p>
        <p>* Untuk USB, pastikan driver printer sudah terinstall di komputer</p>
        <p>* Untuk Bluetooth, hanya mendukung printer dengan BLE (Bluetooth Low Energy)</p>
        <p>* Printer yang sudah pernah dihubungkan via USB akan otomatis reconnect</p>
      </div>
    </div>
  );
}
