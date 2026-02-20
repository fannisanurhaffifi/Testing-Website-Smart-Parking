"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import StatCard from "@/app/components/StatCard";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import { io } from "socket.io-client";
import { LogIn, LogOut } from "lucide-react";

type StatCardData = {
  terisi: number;
  tersedia: number;
  kesempatan_parkir: number;
  is_parked: boolean;
};

export default function MahasiswaHomePage() {
  console.log("🏠 MahasiswaHomePage Component Rendered");

  const [loading, setLoading] = useState(true);
  const [statcard, setStatcard] = useState<StatCardData>({
    terisi: 0,
    tersedia: 0,
    kesempatan_parkir: 0,
    is_parked: false,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const fetchRef = useRef<any>(null);

  /* ================= FETCH STATCARD ================= */
  const fetchStatCard = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const npm = localStorage.getItem("npm");
      if (!npm) return;

      const res = await fetch(`/api/statcard/parkir?npm=${npm}`, {
        cache: "no-store",
        signal
      });

      const result = await res.json();
      console.log("📥 Statcard Data Received:", result);

      if (res.ok && result.success) {
        setStatcard(result.data);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("❌ Gagal mengambil statcard:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRef.current = fetchStatCard;
  }, [fetchStatCard]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStatCard(controller.signal);
    return () => controller.abort();
  }, [fetchStatCard]);

  // Real-time Update
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    console.log("🔌 Initializing socket connection...");
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    console.log("🌐 Socket Host:", socketHost);
    const socket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Mahasiswa Socket Connected to:", socketHost);
      console.log("🆔 Socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket Disconnected:", reason);
    });

    socket.on("parking_update", (payload: any) => {
      console.log("🚗 Mahasiswa Dashboard update:", payload);
      // Re-fetch statcard
      if (fetchRef.current) {
        console.log("🔄 Fetching updated data...");
        fetchRef.current();
      }
      // Re-fetch statistik kendaraan melalui refreshKey
      setRefreshKey(prev => prev + 1);
    });

    socket.on("user_update", (payload: any) => {
      console.log("👥 Mahasiswa User update:", payload);
      if (fetchRef.current) {
        console.log("🔄 Fetching updated user data...");
        fetchRef.current();
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Mahasiswa Socket Error:", err.message);
      console.error("🔍 Error Details:", err);
    });

    return () => {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
    };
  }, []);

  const handleManualPark = async (aksi: "MASUK" | "KELUAR") => {
    const npm = localStorage.getItem("npm");
    if (!npm) {
      alert("NPM tidak ditemukan, silakan login kembali.");
      return;
    }

    const confirm = window.confirm(`Konfirmasi untuk ${aksi} parkir?`);
    if (!confirm) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/mahasiswa/parkir/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, aksi }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Berhasil ${aksi}`);
        if (fetchRef.current) fetchRef.current();
        setRefreshKey(prev => prev + 1);
      } else {
        alert(data.message || "Gagal melakukan aksi parkir");
      }
    } catch (error) {
      console.error("MANUAL PARK ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setActionLoading(false);
    }
  };


  return (
    <div className="space-y-6 md:space-y-8">
      {/* ================= HEADER ================= */}
      <h2 className="text-base md:text-lg font-semibold text-gray-800">Dashboard Parkir</h2>

      {/* ================= STATCARD ================= */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
        <StatCard
          title="Terisi"
          value={statcard.terisi}
          unit="Kendaraan"
          loading={loading}
        />
        <StatCard
          title="Tersedia"
          value={statcard.tersedia}
          unit="Slot"
          loading={loading}
        />
        <StatCard
          title="Kesempatan Parkir"
          value={statcard.kesempatan_parkir}
          unit="Kali"
          loading={loading}
        />
      </section>

      {/* ================= TOMBOL PARKIR MANUAL ================= */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#1F3A93] rounded-full"></span>
          Aksi Parkir Mandiri
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleManualPark("MASUK")}
            disabled={actionLoading || loading || statcard.is_parked}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 disabled:opacity-40 disabled:grayscale ${statcard.is_parked
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-blue-100 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-300"
              }`}
          >
            <div className={`p-3 text-white rounded-full shadow-lg ${statcard.is_parked ? "bg-gray-400" : "bg-blue-900"}`}>
              <LogIn size={24} />
            </div>
            <span className="font-bold text-sm">Masuk Parkir</span>
          </button>

          <button
            onClick={() => handleManualPark("KELUAR")}
            disabled={actionLoading || loading || !statcard.is_parked}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 disabled:opacity-40 disabled:grayscale ${!statcard.is_parked
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-teal-100 bg-teal-50 text-teal-900 hover:bg-teal-100 hover:border-teal-300"
              }`}
          >
            <div className={`p-3 text-white rounded-full shadow-lg ${!statcard.is_parked ? "bg-gray-400" : "bg-teal-600"}`}>
              <LogOut size={24} />
            </div>
            <span className="font-bold text-sm">Keluar Parkir</span>
          </button>
        </div>
        <p className="mt-4 text-[11px] text-gray-500 italic text-center">
          *Gunakan tombol ini jika Anda tidak menggunakan kartu RFID untuk masuk/keluar.
        </p>
      </section>


      {/* ================= GRAFIK STATISTIK ================= */}
      <section>
        <StatistikKendaraan refreshKey={refreshKey} />
      </section>
    </div>
  );
}
