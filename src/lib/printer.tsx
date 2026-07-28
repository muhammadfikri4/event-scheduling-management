"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface PrinterDevice {
  type: "serial" | "bluetooth";
  name: string;
  port?: SerialPort;
  btDevice?: BluetoothDevice;
  btCharacteristic?: BluetoothRemoteGATTCharacteristic;
}

interface PrinterContextType {
  device: PrinterDevice | null;
  status: "disconnected" | "connecting" | "connected";
  connectUSB: () => Promise<void>;
  connectBluetooth: () => Promise<void>;
  disconnect: () => Promise<void>;
  print: (data: Uint8Array) => Promise<void>;
  isSupported: { serial: boolean; bluetooth: boolean };
}

const PrinterContext = createContext<PrinterContextType | null>(null);

export function usePrinter() {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error("usePrinter must be used within PrinterProvider");
  return ctx;
}

// Common BLE service UUIDs for thermal printers
const BLE_SERVICES = [
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "000018f0-0000-1000-8000-00805f9b34fb",
];
const BLE_CHARACTERISTICS = [
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
  "00002af1-0000-1000-8000-00805f9b34fb",
];

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<PrinterDevice | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const isSupported = {
    serial: typeof navigator !== "undefined" && "serial" in navigator,
    bluetooth: typeof navigator !== "undefined" && "bluetooth" in navigator,
  };

  // Auto-reconnect saved USB ports on mount
  useEffect(() => {
    if (!isSupported.serial) return;
    navigator.serial.getPorts().then(async (ports) => {
      if (ports.length > 0 && !device) {
        try {
          setStatus("connecting");
          const port = ports[0];
          if (!port.readable) {
            await port.open({ baudRate: 9600 });
          }
          const info = port.getInfo();
          setDevice({
            type: "serial",
            name: `USB Printer (VID:${info.usbVendorId || "?"})`,
            port,
          });
          setStatus("connected");
        } catch {
          setStatus("disconnected");
        }
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for USB disconnect
  useEffect(() => {
    if (!isSupported.serial) return;
    const handleDisconnect = (e: Event) => {
      const port = (e as CustomEvent).target as SerialPort;
      if (device?.port === port) {
        setDevice(null);
        setStatus("disconnected");
      }
    };
    navigator.serial.addEventListener("disconnect", handleDisconnect);
    return () => navigator.serial.removeEventListener("disconnect", handleDisconnect);
  }, [device, isSupported.serial]);

  const connectUSB = useCallback(async () => {
    if (!isSupported.serial) return;
    try {
      setStatus("connecting");
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      const info = port.getInfo();
      setDevice({
        type: "serial",
        name: `USB Printer (VID:${info.usbVendorId || "?"} PID:${info.usbProductId || "?"})`,
        port,
      });
      setStatus("connected");
    } catch {
      setStatus("disconnected");
    }
  }, [isSupported.serial]);

  const connectBluetooth = useCallback(async () => {
    if (!isSupported.bluetooth) return;
    try {
      setStatus("connecting");
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_SERVICES,
      });

      const server = await btDevice.gatt!.connect();

      // Try to find a writable characteristic
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
      for (const serviceUUID of BLE_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUUID);
          for (const charUUID of BLE_CHARACTERISTICS) {
            try {
              characteristic = await service.getCharacteristic(charUUID);
              break;
            } catch { /* try next */ }
          }
          if (characteristic) break;
        } catch { /* try next service */ }
      }

      if (!characteristic) {
        // Fallback: get first writable characteristic from any service
        const services = await server.getPrimaryServices();
        for (const service of services) {
          try {
            const chars = await service.getCharacteristics();
            for (const c of chars) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                characteristic = c;
                break;
              }
            }
            if (characteristic) break;
          } catch { /* continue */ }
        }
      }

      if (!characteristic) {
        throw new Error("No writable characteristic found");
      }

      btDevice.addEventListener("gattserverdisconnected", () => {
        setDevice(null);
        setStatus("disconnected");
      });

      setDevice({
        type: "bluetooth",
        name: btDevice.name || "Bluetooth Printer",
        btDevice,
        btCharacteristic: characteristic,
      });
      setStatus("connected");
    } catch {
      setStatus("disconnected");
    }
  }, [isSupported.bluetooth]);

  const disconnect = useCallback(async () => {
    if (device?.type === "serial" && device.port) {
      try {
        await device.port.close();
      } catch { /* already closed */ }
    }
    if (device?.type === "bluetooth" && device.btDevice) {
      device.btDevice.gatt?.disconnect();
    }
    setDevice(null);
    setStatus("disconnected");
  }, [device]);

  const print = useCallback(async (data: Uint8Array) => {
    if (!device || status !== "connected") throw new Error("Printer not connected");

    if (device.type === "serial" && device.port) {
      const writer = device.port.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();
    }

    if (device.type === "bluetooth" && device.btCharacteristic) {
      // BLE needs chunking
      const CHUNK = 20;
      for (let i = 0; i < data.length; i += CHUNK) {
        const chunk = data.slice(i, i + CHUNK);
        if (device.btCharacteristic.properties.writeWithoutResponse) {
          await device.btCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await device.btCharacteristic.writeValueWithResponse(chunk);
        }
        await new Promise((r) => setTimeout(r, 10));
      }
    }
  }, [device, status]);

  return (
    <PrinterContext.Provider value={{ device, status, connectUSB, connectBluetooth, disconnect, print, isSupported }}>
      {children}
    </PrinterContext.Provider>
  );
}
