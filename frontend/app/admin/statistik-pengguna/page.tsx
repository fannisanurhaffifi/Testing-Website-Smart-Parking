"use client";

import { useEffect, useState } from "react";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import LaporanExport from "@/app/components/LaporanExport";
import { io } from "socket.io-client";

export default function StatistikPenggunaAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Dynamic Host for Socket.io
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("connect", () => {
      console.log("📈 Statistik Page Socket Connected");
    });

    socket.on("parking_update", (payload: any) => {
      console.log("🔄 Real-time statistik refresh:", payload);
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* ================= STATISTIK KENDARAAN ================= */}
      <section>
        <StatistikKendaraan refreshKey={refreshKey} />
      </section>

      {/* ================= EXPORT LAPORAN ================= */}
      <section>

        <LaporanExport />
      </section>
    </div>
  );
}
