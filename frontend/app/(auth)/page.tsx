"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // NPM / Nama Admin
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("NPM / Nama Admin dan kata sandi wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // Endpoint logic
      const isMahasiswa = /^\d+$/.test(identifier);

      let endpoint = "";
      let payload = {};

      if (isMahasiswa) {
        // MAHASISWA LOGIN via Next.js API Route
        endpoint = "/api/auth/login";
        payload = { npm: identifier, password };
      } else {
        // ADMIN LOGIN via Backend Direct
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`;
        payload = { nama: identifier, password };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login gagal");
        return;
      }

      if (isMahasiswa) {
        // ✅ SIMPAN NPM UNTUK MAHASISWA
        // Perhatikan structure data yang dikembalikan oleh route handler /api/auth/login
        if (data.data && data.data.npm) {
          localStorage.setItem("npm", data.data.npm);
        }
        router.push("/mahasiswa");
      } else {
        // ✅ SIMPAN TOKEN / DATA UNTUK ADMIN
        if (data.data && data.data.nama) {
          localStorage.setItem("admin_nama", data.data.nama);
          localStorage.setItem("id_admin", data.data.id_admin);
        }
        router.push("/admin");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#1F3A93] bg-white p-6 shadow-md">
        {/* LOGO */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-unila.png"
            alt="Logo Universitas Lampung"
            width={56}
            height={56}
            priority
          />
        </div>

        {/* TITLE */}
        <h2 className="mb-2 text-center text-lg font-semibold text-[#1F3A93]">
          Masuk
        </h2>
        <p className="mb-6 text-center text-xs text-gray-600">
          Sistem Monitoring Parkir Teknik Geodesi
        </p>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="NPM / Nama Admin"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm
                       focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm
                       focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white
                       transition hover:bg-[#162C6E] disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* LINKS */}
        <div className="mt-4 text-center text-xs">
          <Link
            href="/lupa-password"
            className="text-gray-600 transition hover:text-[#1F3A93] hover:underline"
          >
            Lupa Kata Sandi?
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-gray-700">
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-semibold text-[#1F3A93] hover:underline"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
