"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function VerifikasiOTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    if (!savedEmail) {
      router.push("/lupa-password");
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Kode OTP wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP tidak valid");
      }

      router.push(`/reset-password/${otp}`);
    } catch (err: any) {
      setError(err.message || "Gagal verifikasi OTP");
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

        <h2 className="mb-4 text-center text-lg font-semibold text-[#1F3A93]">
          Verifikasi OTP
        </h2>

        <p className="mb-4 text-center text-xs text-gray-600">
          Kode OTP telah dikirim ke {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Masukkan 6 Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-center tracking-widest focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white hover:bg-[#162C6E] disabled:opacity-60"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">{error}</p>
        )}

        <div className="mt-6 text-center text-xs">
          <Link
            href="/lupa-password"
            className="text-[#1F3A93] hover:underline"
          >
            Kirim Ulang OTP
          </Link>
        </div>
      </div>
    </div>
  );
}
