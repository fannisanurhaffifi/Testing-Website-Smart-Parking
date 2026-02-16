"use client";

import { useState, useEffect } from "react";

export default function LaporanExport() {
  const [format, setFormat] = useState<"pdf" | "csv" | "excel">("pdf");
  const [periode, setPeriode] = useState("harian");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateError, setDateError] = useState("");

  // Fungsi untuk menghitung selisih hari
  const getDaysDifference = (date1: string, date2: string) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Validasi tanggal berdasarkan periode
  useEffect(() => {
    if (!from || !to) {
      setDateError("");
      return;
    }

    const daysDiff = getDaysDifference(from, to);

    if (periode === "harian" && daysDiff !== 0) {
      setDateError("Periode harian hanya untuk 1 hari yang sama");
    } else if (periode === "mingguan" && daysDiff !== 6) {
      setDateError("Periode mingguan harus tepat 7 hari (6 hari selisih)");
    } else if (periode === "bulanan" && daysDiff !== 29) {
      setDateError("Periode bulanan harus tepat 30 hari (29 hari selisih)");
    } else {
      setDateError("");
    }
  }, [from, to, periode]);

  // Auto-set tanggal "Sampai" berdasarkan periode
  const handleFromDateChange = (date: string) => {
    setFrom(date);

    if (!date) {
      setTo("");
      return;
    }

    const startDate = new Date(date);
    let endDate = new Date(date);

    if (periode === "harian") {
      // Sama dengan tanggal mulai
      endDate = new Date(date);
    } else if (periode === "mingguan") {
      // Tambah 6 hari (total 7 hari)
      endDate.setDate(startDate.getDate() + 6);
    } else if (periode === "bulanan") {
      // Tambah 29 hari (total 30 hari)
      endDate.setDate(startDate.getDate() + 29);
    }

    const endDateString = endDate.toISOString().split('T')[0];
    setTo(endDateString);
  };

  const handleExport = () => {
    if (dateError) {
      alert("Silakan perbaiki rentang tanggal terlebih dahulu");
      return;
    }

    if (!from || !to) {
      alert("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    if (format !== "pdf") {
      alert("Saat ini hanya PDF yang tersedia");
      return;
    }

    let url = `/api/admin/export/pdf?periode=${periode}`;

    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-800">
        Export Laporan Akhir
      </h3>

      {/* ===== PERIODE ===== */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Periode</label>
          <div className="relative">
            <select
              value={periode}
              onChange={(e) => {
                setPeriode(e.target.value);
                setFrom("");
                setTo("");
                setDateError("");
              }}
              className="appearance-none mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-xs bg-white focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 mt-1">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            {periode === "harian" && "Pilih 1 hari yang sama"}
            {periode === "mingguan" && "Otomatis 7 hari dari tanggal mulai"}
            {periode === "bulanan" && "Otomatis 30 hari dari tanggal mulai"}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] bg-gray-50"
            readOnly
            title="Tanggal akhir otomatis disesuaikan dengan periode"
          />
        </div>
      </div>

      {/* Error Message */}
      {dateError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          ⚠️ {dateError}
        </div>
      )}

      {/* ===== FORMAT FILE ===== */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-gray-600">
          Format File
        </label>

        <div className="flex gap-6 text-xs">
          {["pdf", "csv", "excel"].map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="format"
                value={item}
                checked={format === item}
                onChange={() => setFormat(item as any)}
                className="accent-[#1F3A93]"
              />
              {item.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      {/* ===== BUTTON ===== */}
      <button
        type="button"
        onClick={handleExport}
        disabled={!!dateError || !from || !to}
        className="rounded-md bg-[#1F3A93] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#162C6E] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Export Laporan
      </button>
    </div>
  );
}
