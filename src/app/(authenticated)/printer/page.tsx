"use client";

import { Usb, Bluetooth, Unplug, Printer, CheckCircle2, XCircle, Loader2, Plus, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrinter } from "@/lib/printer";
import { toast } from "sonner";

export default function PrinterPage() {
  const { device, status, savedPorts, connectUSB, connectPort, connectBluetooth, disconnect, print, isSupported } = usePrinter();

  async function handleTestPrint() {
    try {
      const encoder = new TextEncoder();
      const data = new Uint8Array([
        0x1B, 0x40,                                           // ESC @ — initialize
        0x1B, 0x61, 0x01,                                     // center
        0x1B, 0x45, 0x01,                                     // bold on
        ...encoder.encode("TEST PRINT\n"),
        0x1B, 0x45, 0x00,                                     // bold off
        ...encoder.encode("================================\n"),
        ...encoder.encode("Printer berhasil terhubung!\n"),
        ...encoder.encode(`${new Date().toLocaleString("id-ID")}\n`),
        ...encoder.encode("================================\n\n\n\n"),
        0x1D, 0x56, 0x00,                                     // full cut
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
        <p className="text-sm text-muted-foreground">Hubungkan dan kelola printer thermal</p>
      </div>

      {/* Active Connection */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${status === "connected" ? "bg-green-100 dark:bg-green-950/50" : status === "connecting" ? "bg-yellow-100 dark:bg-yellow-950/50" : "bg-muted"}`}>
            {status === "connected" ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : status === "connecting" ? (
              <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
            ) : (
              <XCircle className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">
                {status === "connected" ? device?.name : status === "connecting" ? "Menghubungkan..." : "Tidak ada printer aktif"}
              </p>
              {status === "connected" && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {device?.type === "serial" ? "USB" : "Bluetooth"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status === "connected"
                ? "Siap cetak nota"
                : "Pilih printer di bawah atau tambah printer baru"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {status === "connected" && (
              <>
                <Button variant="outline" size="sm" onClick={handleTestPrint}>
                  <Printer className="w-4 h-4" /> Test
                </Button>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  <Unplug className="w-4 h-4" /> Putuskan
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Saved USB Devices */}
      {savedPorts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">Printer Tersimpan (USB)</h2>
          {savedPorts.map((sp, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <Usb className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{sp.label}</p>
                  <p className="text-xs text-muted-foreground">
                    VID: {sp.info.usbVendorId || "?"} · PID: {sp.info.usbProductId || "?"}
                  </p>
                </div>
                {sp.connected ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 shrink-0">Aktif</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => connectPort(sp.port)}
                    disabled={status === "connecting"}
                  >
                    <Plug className="w-4 h-4" /> Hubungkan
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Device */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">Tambah Printer Baru</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card
            className={`p-4 ${!isSupported.serial ? "opacity-50" : "cursor-pointer hover:shadow-md transition-shadow"}`}
            onClick={isSupported.serial && status !== "connecting" ? connectUSB : undefined}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                <Usb className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> USB (Kabel)
                </p>
                <p className="text-xs text-muted-foreground">Colok printer lalu klik di sini</p>
              </div>
            </div>
            {!isSupported.serial && (
              <p className="text-[10px] text-destructive mt-2">Browser tidak support. Gunakan Chrome.</p>
            )}
          </Card>

          <Card
            className={`p-4 ${!isSupported.bluetooth ? "opacity-50" : "cursor-pointer hover:shadow-md transition-shadow"}`}
            onClick={isSupported.bluetooth && status !== "connecting" ? connectBluetooth : undefined}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                <Bluetooth className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Bluetooth
                </p>
                <p className="text-xs text-muted-foreground">Scan printer Bluetooth terdekat</p>
              </div>
            </div>
            {!isSupported.bluetooth && (
              <p className="text-[10px] text-destructive mt-2">Browser tidak support. Gunakan Chrome.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <p>* Memerlukan <strong>Google Chrome</strong> versi 89+</p>
        <p>* Printer USB yang sudah pernah dihubungkan akan tersimpan dan bisa di-reconnect</p>
        <p>* Bluetooth hanya support BLE (Bluetooth Low Energy)</p>
        <p>* Saat mencetak nota, jika printer aktif maka langsung cetak ke device. Jika tidak, gunakan print dialog browser.</p>
      </div>
    </div>
  );
}
