"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function LupaPasswordSuksesPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F3A93] bg-white p-6 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>

        <h2 className="mb-3 text-lg font-semibold text-[#1F3A93]">
          Kata Sandi Berhasil Diubah
        </h2>

        <p className="mb-5 text-sm text-gray-600">
          Silakan Masuk kembali menggunakan kata sandi baru Anda.
        </p>

        <Link
          href="/"
          className="inline-block w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white hover:bg-[#162C6E]"
        >
          Kembali ke Masuk
        </Link>
      </div>
    </div>
  );
}
