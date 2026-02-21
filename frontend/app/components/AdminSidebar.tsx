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
      // Sesuaikan dengan endpoint yang benar
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // 🔥 HAPUS DATA LOGIN ADMIN (sesuai dengan key di login page)
      localStorage.removeItem("admin_nama");
      localStorage.removeItem("id_admin");

      // Redirect ke login
      router.push("/");
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  return (
    // SIDEBAR: w-16 pada mobile (icons only), md:w-64 pada desktop
    <aside className="w-16 md:w-64 bg-[#E9EBEE] p-2 md:p-4 h-screen sticky top-0 flex flex-col transition-all duration-300">
      {/* ===== MENU ===== */}
      <nav className="space-y-2 flex-1">
        <SidebarItem
          href="/admin"
          icon={<BarChart3 size={18} />}
          label="Beranda"
          active={isActive("/admin")}
        />

        <SidebarItem
          href="/admin/statistik-pengguna"
          icon={<BarChart3 size={18} />}
          label="Statistik"
          active={isActive("/admin/statistik-pengguna")}
        />

        <SidebarItem
          href="/admin/pengguna-parkir"
          icon={<Users size={18} />}
          label="Pengguna"
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
      <hr className="my-6 border-gray-300 mx-2" />

      {/* ===== LOGOUT ===== */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          flex w-full items-center justify-center md:justify-start gap-3 rounded-lg
          bg-red-600 px-2 md:px-4 py-2 text-sm font-semibold text-white
          transition hover:bg-red-700
        "
        title="Keluar"
      >
        <LogOut size={18} />
        <span className="hidden md:block">Keluar</span>
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
        flex items-center justify-center md:justify-start gap-3 rounded-lg px-2 md:px-4 py-2
        text-sm font-medium transition-all duration-200
        ${active}
      `}
      title={label}
    >
      {icon}
      <span className="hidden md:block whitespace-nowrap">{label}</span>
    </Link>
  );
}
