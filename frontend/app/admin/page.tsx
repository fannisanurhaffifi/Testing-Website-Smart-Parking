"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import StatCard from "@/app/components/StatCard";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import DataKendaraanParkir from "@/app/components/DataKendaraanParkir";
import { io } from "socket.io-client";

type DashboardSummary = {
  total_slot: number;
  terisi: number;
  tersedia: number;
  pengguna_aktif: number;
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_slot: 0,
    terisi: 0,
    tersedia: 0,
    pengguna_aktif: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newSlot, setNewSlot] = useState<number | "">(0);
  const [updatingSlot, setUpdatingSlot] = useState<boolean>(false);

  // Ref untuk menyimpan fungsi fetch terbaru agar tidak memicu reconnnect socket
  const fetchRef = useRef<any>(null);

  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/admin/dashboard/summary", {
        cache: "no-store",
        signal,
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data dashboard");
      }

      const json = await res.json();

      if (json.status === "success") {
        setSummary(json.data);
        setNewSlot(json.data.total_slot);
      } else {
        throw new Error(json.message || "Terjadi kesalahan");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
        setError("Gagal memuat data dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update ref setiap kali fetchSummary berubah
  useEffect(() => {
    fetchRef.current = fetchSummary;
  }, [fetchSummary]);

  const handleUpdateSlot = async () => {
    const slotValue = Number(newSlot);
    if (newSlot === "" || isNaN(slotValue) || slotValue < 0) {
      alert("Jumlah slot tidak valid");
      return;
    }

    setUpdatingSlot(true);
    try {
      const res = await fetch("/api/admin/slot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah: slotValue }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchSummary();
      } else {
        alert(data.message || "Gagal memperbarui slot");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setUpdatingSlot(false);
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchSummary(controller.signal);
    return () => controller.abort();
  }, [fetchSummary]);

  useEffect(() => {
    // Dynamic Host for Socket.io
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("connect", () => {
      console.log("✅ Dashboard Socket Connected");
    });

    socket.on("parking_update", (payload: any) => {
      console.log("📊 Dashboard update received (parking):", payload);
      if (fetchRef.current) fetchRef.current();
      setRefreshKey(prev => prev + 1);
    });

    socket.on("user_update", (payload: any) => {
      console.log("👥 Dashboard update received (user):", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Dashboard Socket Error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Dependency kosong

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">Loading Beranda...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ================= STAT CARD ================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {/* CUSTOM SLOT CARD WITH INLINE EDIT */}
        <div className="rounded-xl bg-gray-200 p-3 md:p-5 shadow-sm transition hover:shadow-md">
          <p className="text-xs md:text-sm font-semibold text-gray-700">Total Slot</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-end gap-1">
              <span className="text-xl md:text-2xl font-bold text-[#1F3A93]">
                {summary.total_slot}
              </span>
              <span className="text-xs md:text-sm font-medium text-gray-600">Slot</span>
            </div>

            {/* INLINE EDIT FORM */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="w-16 rounded-md border border-gray-300 px-2 py-0.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
              />
              <button
                onClick={handleUpdateSlot}
                disabled={updatingSlot}
                className="rounded-md bg-[#1F3A93] px-2 py-0.5 text-[10px] font-semibold text-white transition hover:bg-[#162C6E] disabled:opacity-60"
              >
                {updatingSlot ? "..." : "Perbarui"}
              </button>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-gray-500 italic">Kapasitas total saat ini</p>
        </div>

        <StatCard title="Terisi" value={summary.terisi} unit="Kendaraan" />
        <StatCard title="Tersedia" value={summary.tersedia} unit="Slot" />
        <StatCard title="Pengguna Aktif" value={summary.pengguna_aktif} unit="Pengguna" />
      </div>

      {/* ================= STATISTIK ================= */}
      <div className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-4 md:p-6">
        <StatistikKendaraan refreshKey={refreshKey} />
      </div>

      {/* ================= DATA PARKIR ================= */}
      <DataKendaraanParkir />
    </div>
  );
}
