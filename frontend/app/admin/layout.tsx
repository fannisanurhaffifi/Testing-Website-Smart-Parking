import AdminNavbar from "@/app/components/AdminNavbar";
import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6F8]">
      {/* ===== NAVBAR ===== */}
      <AdminNavbar />

      {/* ===== BODY ===== */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <AdminSidebar />

        {/* CONTENT */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
