"use client";

import Image from "next/image";
import Link from "next/link";

export default function DaftarSuksesPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F3A93] bg-white p-6 text-center shadow-sm">
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
        <h2 className="mb-3 text-lg font-semibold text-[#1F3A93]">
          Pendaftaran Berhasil
        </h2>

        {/* MESSAGE */}
        <p className="mb-4 text-sm text-gray-700">
          Permohonan pembuatan akun Anda telah berhasil dikirim dan saat ini
          sedang menunggu proses verifikasi oleh admin.
        </p>

        <div className="mb-5 rounded-lg bg-[#E9EBEE] p-3 text-xs text-gray-700">
          Setelah akun Anda disetujui (ACC) oleh admin, Anda dapat langsung
          masuk menggunakan akun yang telah didaftarkan.
        </div>

        {/* BUTTON KE ROOT (HALAMAN MASUK) */}
        <Link
          href="/"
          className="inline-block w-full rounded-lg bg-[#1F3A93] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#162C6E]"
        >
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}
