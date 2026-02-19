"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Check, X, Ban, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LogIn, LogOut } from "lucide-react";
import { io } from "socket.io-client";

type User = {
  npm: string;
  nama: string;
  plat_nomor: string | null;
  status_akun: number | null; // 1 aktif, 0 menunggu, 2 diblokir
  stnk: string | null;
  sisa_kuota: number;
};

type Props = {
  search: string;
  statusFilter: string;
};

export default function DataPenggunaTable({
  search,
  statusFilter,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination State
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchRef = useRef<any>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      // Proteksi agar tidak mengirim "undefined" atau string kosong
      if (search && search.trim() !== "") {
        params.append("search", search.trim());
      }

      // Hanya tambahkan param status jika filter spesifik dipilih (bukan "semua" atau "")
      if (statusFilter && statusFilter !== "semua" && statusFilter !== "") {
        const val =
          statusFilter === "aktif" ? "1" :
            statusFilter === "diblokir" ? "2" :
              statusFilter === "ditolak" ? "3" : "0";
        params.append("status", val);
      }

      const res = await fetch(`/api/admin/pengguna?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        setUsers(json.data ?? []);
        setTotalData(json.total || 0);
      } else {
        setUsers([]);
        setTotalData(0);
        setError(json.message || "Gagal mengambil data dari server");
      }
    } catch (err: any) {
      console.error("FETCH USERS ERROR:", err);
      setUsers([]);
      setTotalData(0);
      setError("Terjadi kesalahan jaringan atau server");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  // Update ref
  useEffect(() => {
    fetchRef.current = fetchUsers;
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, limit]);

  // Hook fetch data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Hook Socket - Sekali pas mount
  useEffect(() => {
    // Dynamic Host for Socket.io
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("connect", () => {
      console.log("✅ User Table Socket Connected");
    });

    socket.on("parking_update", (payload: any) => {
      console.log("🔄 Real-time table update (parking):", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("user_update", (payload: any) => {
      console.log("👥 Real-time table update (user):", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ User Table Socket Error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleManualPark = async (npm: string, aksi: "MASUK" | "KELUAR") => {
    const confirm = window.confirm(`Lakukan proses ${aksi} manual untuk NPM ${npm}?`);
    if (!confirm) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/parkir/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, aksi }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await fetchUsers();
      } else {
        alert(data.message || "Gagal melakukan aksi manual");
      }
    } catch (error) {
      console.error("MANUAL PARK ERROR:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (npm: string, status: number) => {
    let message = "Aktifkan hak parkir pengguna ini?";
    if (status === 2) message = "Blokir hak parkir pengguna ini?";

    const confirm = window.confirm(message);
    if (!confirm) return;

    try {
      setActionLoading(true);

      const res = await fetch("/api/admin/pengguna/verifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, status_akun: status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal dari server");

      await fetchUsers();
      alert(data.message || "Status berhasil diperbarui");
    } catch (error: any) {
      console.error("STATUS UPDATE ERROR:", error);
      alert(error.message || "Gagal memperbarui status pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (npm: string) => {
    const confirm = window.confirm(
      "Hapus pengguna ini? Data tidak bisa dikembalikan."
    );
    if (!confirm) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/pengguna/${npm}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
    } catch {
      alert("Gagal menghapus pengguna");
    } finally {
      setActionLoading(false);
    }
  };

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

  if (loading) {
    return (
      <p className="text-xs text-gray-500">
        Memuat data pengguna...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 border border-red-200">
        <p className="text-sm text-red-600 font-medium">⚠️ Error: {error}</p>
        <button
          onClick={() => fetchUsers()}
          className="mt-2 text-xs font-bold text-red-700 underline hover:no-underline"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-2 md:p-4 shadow-sm border border-gray-100">

      {/* HEADER: TITLE & LIMIT SELECTOR */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-800">
          Data Pengguna Parkir
        </h2>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Tampilkan</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 focus:border-[#1F3A93] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-500">data per halaman</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <Th>No</Th>
              <Th>NPM</Th>
              <Th>Nama</Th>
              <Th>Nomor Kendaraan</Th>
              <Th>Kesempatan Parkir</Th>
              <Th>STNK</Th>
              <Th>Status</Th>
              <Th>Aksi</Th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <Td colSpan={8}>
                  <span className="text-gray-500">
                    Tidak ada data pengguna
                  </span>
                </Td>
              </tr>
            )}

            {users.map((user, index) => {
              const statusLabel = user.status_akun === 1 ? "Aktif" : "Diblokir";

              return (
                <tr
                  key={user.npm}
                  className="border-t text-center hover:bg-[#F4F6F8] transition-colors"
                >
                  <Td className="text-gray-500 text-[11px]">{(page - 1) * limit + index + 1}</Td>
                  <Td>{user.npm}</Td>

                  <Td>
                    <Link
                      href={`/admin/pengguna-parkir/${user.npm}`}
                      className="font-semibold text-[#1F3A93] hover:underline"
                    >
                      {user.nama}
                    </Link>
                  </Td>

                  <Td>{user.plat_nomor ?? "-"}</Td>

                  <Td>
                    <span className="font-semibold text-gray-700">
                      {user.sisa_kuota} kali
                    </span>
                  </Td>

                  <Td>
                    {user.stnk ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.stnk}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded"
                      >
                        LIHAT STNK
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400">TIDAK ADA</span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`rounded-full px-2 md:px-3 py-1 text-[10px] md:text-[11px] font-semibold whitespace-nowrap
                        ${statusLabel === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {statusLabel}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex justify-center gap-1 md:gap-2">
                      {user.status_akun !== 1 ? (
                        <button
                          disabled={actionLoading}
                          title="Aktifkan Akun"
                          onClick={() => updateStatus(user.npm, 1)}
                          className="rounded-md bg-green-600 p-1.5 text-white hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading}
                          title="Blokir Akun"
                          onClick={() => updateStatus(user.npm, 2)}
                          className="rounded-md bg-orange-500 p-1.5 text-white hover:bg-orange-600 disabled:opacity-50 transition shadow-sm"
                        >
                          <Ban size={14} />
                        </button>
                      )}

                      <button
                        disabled={actionLoading}
                        title="Hapus"
                        onClick={() => deleteUser(user.npm)}
                        className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER: INFO & PAGINATION */}
      {users.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 text-xs text-gray-600 border-t pt-4">

          {/* Status Info */}
          <div>
            Menampilkan <span className="font-semibold">{(page - 1) * limit + 1}</span> -{" "}
            <span className="font-semibold">{Math.min(page * limit, totalData)}</span> dari{" "}
            <span className="font-semibold">{totalData}</span> data
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
              title="Awal"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
              title="Kembali"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1 mx-1">
              {getPageNumbers().map(num => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-medium transition ${page === num
                    ? "bg-[#1F3A93] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Mobile View Page Indicator */}
            <span className="sm:hidden mx-2 font-medium">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
              title="Lanjut"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
              title="Akhir"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}


/* ===== REUSABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-xs font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({
  children,
  colSpan,
  className = "",
}: {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td colSpan={colSpan} className={`px-3 py-2 text-xs ${className}`}>
      {children}
    </td>
  );
}
