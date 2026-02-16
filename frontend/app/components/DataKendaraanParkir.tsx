"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { io } from "socket.io-client";

type Kendaraan = {
  no?: number;
  npm: string;
  nama: string;
  plat_motor: string;
  tanggal: string;
  hari: string;
  masuk: string;
  keluar: string;
  status: "Terparkir" | "Keluar";
};

type Props = {
  search?: string;
  startDate?: string;
  endDate?: string;
};

export default function DataKendaraanParkir({
  search = "",
  startDate = "",
  endDate = "",
}: Props = {}) {
  const [data, setData] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination State
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Ref untuk menyimpan fungsi fetch terbaru agar tidak memicu reconnnect socket
  const fetchRef = useRef<any>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      if (search) params.append("search", search);
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);

      const res = await fetch(`/api/admin/parkir?${params.toString()}`, {
        cache: "no-store",
        signal,
      });

      if (!res.ok) throw new Error("HTTP error");
      const json = await res.json();

      if (json.status === "success") {
        setData(json.data || []);
        setTotalData(json.total || 0);
      } else {
        setData([]);
        setTotalData(0);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("FETCH DATA PARKIR ERROR:", err);
        setError("Gagal memuat data parkir");
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, startDate, endDate]);

  // Update ref setiap kali fetchData berubah
  useEffect(() => {
    fetchRef.current = fetchData;
  }, [fetchData]);

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, limit]);

  // 1. Hook untuk fetch data saat filter/page berubah
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    // Dynamic Host for Socket.io
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("connect", () => {
      console.log("✅ Table Socket Connected");
    });

    socket.on("parking_update", (payload: any) => {
      console.log("🔄 Real-time table update received:", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Table Socket Error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Hitung total halaman
  const totalPages = Math.ceil(totalData / limit);

  // Generate range halaman (misal 1 2 3)
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="rounded-xl bg-[#E9EBEE] p-6 shadow-sm border border-gray-200">
      {/* ===== HEADER ===== */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-800">
          Data Kendaraan Parkir
        </h2>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Tampilkan</span>
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset page saat limit berubah
              }}
              className="appearance-none rounded-md border border-gray-300 px-2 py-1 pr-7 bg-white
                focus:border-[#1F3A93] focus:outline-none"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            {/* Custom Dropdown Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <span className="text-gray-600">data per halaman</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto rounded-lg bg-white border border-gray-200">
        <table className="w-full border-collapse text-xs min-w-[900px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <Th>No</Th>
              <Th>NPM</Th>
              <Th>Nama</Th>
              <Th>Nomor Kendaraan</Th>
              <Th>Tanggal</Th>
              <Th>Hari</Th>
              <Th>Masuk</Th>
              <Th>Keluar</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Memuat data parkir...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && !error && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Tidak ada data kendaraan yang ditemukan
                </td>
              </tr>
            )}

            {!loading &&
              data.map((item, index) => (
                <tr
                  key={`${item.npm}-${item.tanggal}-${item.masuk}-${index}`}
                  className="border-t text-center transition hover:bg-[#F4F6F8]"
                >
                  {/* Perhitungan No: (page - 1) * limit + index + 1 */}
                  <Td className="text-gray-500">{(page - 1) * limit + index + 1}</Td>
                  <Td className="font-medium text-gray-600">{item.npm}</Td>
                  <Td className="font-semibold text-[#1F3A93]">{item.nama}</Td>
                  <Td>{item.plat_motor}</Td>
                  <Td>{item.tanggal}</Td>
                  <Td>{item.hari}</Td>
                  <Td>{item.masuk}</Td>
                  <Td>{item.keluar}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 md:px-3 py-1 text-[10px] md:text-[11px] font-semibold whitespace-nowrap ${item.status === "Terparkir"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {item.status}
                    </span>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ===== INFO & PAGINATION ===== */}
      {!loading && !error && data.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 border-t border-gray-300 pt-4">

          {/* Info Data */}
          <div>
            Menampilkan <span className="font-semibold">{(page - 1) * limit + 1}</span> -{" "}
            <span className="font-semibold">{Math.min(page * limit, totalData)}</span> dari{" "}
            <span className="font-semibold">{totalData}</span> data
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded hover:bg-white disabled:opacity-30 transition"
              title="Halaman Pertama"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-white disabled:opacity-30 transition"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Clickable Page Numbers */}
            <div className="hidden sm:flex items-center gap-1 mx-1">
              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-medium transition ${page === num
                    ? "bg-[#1F3A93] text-white"
                    : "hover:bg-white text-gray-700"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Mobile Indicator */}
            <span className="sm:hidden mx-2 font-medium text-gray-800">
              {page} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-white disabled:opacity-30 transition"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-white disabled:opacity-30 transition"
              title="Halaman Terakhir"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-red-500 px-1">{error}</div>
      )}
    </section>
  );
}

/* ===== REUSABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-gray-700">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
