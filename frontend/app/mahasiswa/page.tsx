"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import StatCard from "@/app/components/StatCard";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import { io } from "socket.io-client";

type StatCardData = {
  terisi: number;
  tersedia: number;
  kesempatan_parkir: number;
};

export default function MahasiswaHomePage() {
  console.log("🏠 MahasiswaHomePage Component Rendered");

  const [loading, setLoading] = useState(true);
  const [statcard, setStatcard] = useState<StatCardData>({
    terisi: 0,
    tersedia: 0,
    kesempatan_parkir: 0,
  });

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

      {/* ================= GRAFIK STATISTIK ================= */}
      <section>
        <StatistikKendaraan refreshKey={refreshKey} />
      </section>
    </div>
  );
}
