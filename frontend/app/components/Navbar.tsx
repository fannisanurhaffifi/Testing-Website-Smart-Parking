"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User, Info, BarChart3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path
      ? "font-semibold text-[#1F3A93] bg-blue-50/50 rounded-md"
      : "text-gray-700 hover:bg-gray-100 hover:text-[#1F3A93] rounded-md";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // 🔥 Hapus data login dari localStorage
      localStorage.removeItem("npm");
      localStorage.removeItem("user");

      // Redirect ke halaman login
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { href: "/mahasiswa/informasi-parkir", label: "Informasi Parkir", icon: <Info size={16} /> },
    { href: "/mahasiswa/statistik-kendaraan", label: "Statistik Kendaraan", icon: <BarChart3 size={16} /> },
  ];

  return (
    <nav className="w-full border-b border-gray-300 bg-[#1F3A93] text-white relative z-50">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* LEFT */}
        <Link
          href="/mahasiswa"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity group"
        >
          <Image
            src="/logo-unila.png"
            alt="Logo Sistem Monitoring Parkir"
            width={48}
            height={48}
            className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            priority
          />
          <div className="text-xs font-semibold leading-tight sm:text-sm lg:text-base group-hover:text-blue-200 transition-colors">
            Sistem Monitoring Parkir <br />
            Teknik Geodesi
          </div>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
          {/* PROFIL */}
          <Link
            href="/mahasiswa/profil"
            className={`flex items-center gap-1 transition-colors hover:underline ${pathname === "/mahasiswa/profil" ? "font-semibold underline" : ""
              }`}
          >
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Mahasiswa</span>
          </Link>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 transition-colors hover:text-red-400"
          >
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* ================= MENU BAR (Always Visible) ================= */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-4 bg-[#E9EBEE] px-4 py-2 text-xs text-black sm:gap-6 sm:px-6 sm:text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-2 py-1 transition-colors ${isActive(link.href)}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
