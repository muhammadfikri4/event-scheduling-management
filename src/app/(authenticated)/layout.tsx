import { Sidebar } from "@/components/sidebar";
import { PrinterProvider } from "@/lib/printer";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrinterProvider>
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 lg:ml-60 min-h-screen flex flex-col">{children}</main>
    </PrinterProvider>
  );
}
