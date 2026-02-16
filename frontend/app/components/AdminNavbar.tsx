"use client";

import Image from "next/image";
import Link from "next/link";
import { UserCog, Menu, X, BarChart3, Users, ParkingCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path
      ? "bg-[#1F3A93] text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-[#1F3A93]";

  useEffect(() => {
    const handleResize = () => {
      // Auto close drawer if screen becomes large enough (desktop mode >= 768px)
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const menuItems = [
    { href: "/admin", icon: <BarChart3 size={20} />, label: "Beranda" },
    {
      href: "/admin/statistik-pengguna",
      icon: <BarChart3 size={20} />,
      label: "Statistik Pengguna",
    },
    {
      href: "/admin/pengguna-parkir",
      icon: <Users size={20} />,
      label: "Pengguna Parkir",
    },
    {
      href: "/admin/data-parkir",
      icon: <ParkingCircle size={20} />,
      label: "Data Parkir",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#1F3A93] text-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">

          {/* HAMBURGER MENU BUTTON */}
          {/* HANYA MUNCUL DI LAYAR SANGAT KECIL (MOBILE < 768px / md) */}
          <button
            className="block md:hidden p-1 rounded hover:bg-[#344FA0] transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition">
            <Image
              src="/logo-unila.png"
              alt="Logo Sistem Monitoring Parkir"
              width={44}
              height={44}
              className="h-8 w-8 sm:h-10 sm:w-10"
              priority
            />

            <div className="text-xs font-semibold leading-tight sm:text-sm">
              Sistem Monitoring Parkir <br />
              Teknik Geodesi
            </div>
          </Link>
        </div>

        {/* RIGHT SECTION - DESKTOP ONLY (sm+) */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <UserCog size={18} />
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER (md hidden) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white text-black shadow-lg border-b py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2">

          <div className="flex items-center gap-2 px-4 py-2 mb-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
            <UserCog size={16} />
            <span className="font-semibold">Logged in as Admin</span>
          </div>

          <hr className="border-gray-100 mb-2" />

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(
                item.href
              )}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
