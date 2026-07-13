import { Sidebar } from "@/components/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 lg:ml-60 min-h-screen flex flex-col">{children}</main>
    </>
  );
}
