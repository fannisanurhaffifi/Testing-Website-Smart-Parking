"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LupaPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim OTP");
      }

      // Simpan email ke sessionStorage agar bisa dipakai di halaman verifikasi
      sessionStorage.setItem("reset_email", email);

      router.push("/lupa-password/verifikasi");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F3A93] bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-unila.png" alt="Logo" width={60} height={60} />
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold text-[#1F3A93]">
          Lupa Kata Sandi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Masukkan Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white hover:bg-[#162C6E] disabled:opacity-60"
          >
            {loading ? "Mengirim OTP..." : "Kirim OTP"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">{error}</p>
        )}

        <div className="mt-6 text-center text-xs">
          <Link href="/" className="text-[#1F3A93] hover:underline">
            Kembali ke Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
