"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, BarChart3, ParkingCircle, LogOut } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path
      ? "bg-[#1F3A93] text-white"
      : "text-gray-700 hover:bg-[#1F3A93] hover:text-white";

  // ================= LOGOUT HANDLER =================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      // 🔥 HAPUS DATA LOGIN ADMIN
      localStorage.removeItem("admin");
      localStorage.removeItem("admin_id");

      // Redirect ke login
      router.push("/");
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  return (
    // SIDEBAR HANYA MUNCUL DI DISPLAY BESAR (LG 1024px KE ATAS)
    <aside className="hidden md:block w-64 bg-[#E9EBEE] p-4 h-screen sticky top-0">
      {/* ===== MENU ===== */}
      <nav className="space-y-2">
        <SidebarItem
          href="/admin"
          icon={<BarChart3 size={18} />}
          label="Beranda"
          active={isActive("/admin")}
        />

        <SidebarItem
          href="/admin/statistik-pengguna"
          icon={<BarChart3 size={18} />}
          label="Statistik Pengguna"
          active={isActive("/admin/statistik-pengguna")}
        />

        <SidebarItem
          href="/admin/pengguna-parkir"
          icon={<Users size={18} />}
          label="Pengguna Parkir"
          active={isActive("/admin/pengguna-parkir")}
        />

        <SidebarItem
          href="/admin/data-parkir"
          icon={<ParkingCircle size={18} />}
          label="Data Parkir"
          active={isActive("/admin/data-parkir")}
        />
      </nav>

      {/* ===== DIVIDER ===== */}
      <hr className="my-6 border-gray-300" />

      {/* ===== LOGOUT ===== */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          flex w-full items-center gap-3 rounded-lg
          bg-red-600 px-4 py-2 text-sm font-semibold text-white
          transition hover:bg-red-700
        "
      >
        <LogOut size={18} />
        Keluar
      </button>
    </aside>
  );
}

/* ================= ITEM ================= */
function SidebarItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: string;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-lg px-4 py-2
        text-sm font-medium transition-colors duration-200
        ${active}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}
