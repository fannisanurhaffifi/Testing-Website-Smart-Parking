"use client";

import { useEffect, useState } from "react";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import { io } from "socket.io-client";

export default function StatistikKendaraanPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("parking_update", (payload: any) => {
      console.log("📈 Statistik real-time refresh:", payload);
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* ===== INFORMASI ===== */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-[#1F3A93] mb-2">
          📊 Tentang Statistik
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          Statistik ini menampilkan <span className="font-semibold">jumlah kendaraan yang masuk</span> pada waktu tertentu.
          Data diperbarui secara otomatis dan real-time.
        </p>
      </div>

      {/* ===== STATISTIK ===== */}
      <StatistikKendaraan refreshKey={refreshKey} />
    </div>
  );
}
