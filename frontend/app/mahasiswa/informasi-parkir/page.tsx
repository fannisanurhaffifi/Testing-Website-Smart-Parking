"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import StatCard from "@/app/components/StatCard";
import { io } from "socket.io-client";

/* ===== TIPE DATA RIWAYAT ===== */
type RiwayatMasuk = {
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  status: "Masuk" | "Keluar";
};

/* ===== TIPE DATA STATCARD ===== */
type StatCardData = {
  terisi: number;
  tersedia: number;
  kesempatan_parkir: number;
};

export default function InformasiParkirPage() {
  const [loading, setLoading] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const [statcard, setStatcard] = useState<StatCardData>({
    terisi: 0,
    tersedia: 0,
    kesempatan_parkir: 0,
  });

  const [riwayat, setRiwayat] = useState<RiwayatMasuk[]>([]);

  const fetchRef = useRef<any>(null);
  const riwayatRef = useRef<any>(null);

  /* ================= STATCARD ================= */
  const fetchStatCard = useCallback(async (signal?: AbortSignal) => {
    try {
      const npm = localStorage.getItem("npm");
      let url = `/api/statcard/parkir`;
      if (npm) url += `?npm=${npm}`;

      const res = await fetch(url, {
        cache: "no-store",
        signal
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatcard(result.data);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Gagal mengambil statcard:", error);
      }
    }
  }, []);


  /* ================= RIWAYAT PARKIR ================= */
  const fetchRiwayatParkir = useCallback(async (signal?: AbortSignal) => {
    try {
      const npm = localStorage.getItem("npm");

      if (!npm) {
        setRiwayat([]);
        return;
      }

      const res = await fetch(
        `/api/pengguna/users/riwayat/${npm}`,
        { cache: "no-store", signal },
      );

      const result = await res.json();

      if (res.ok && result.status === "success") {
        const mapped: RiwayatMasuk[] = result.data.map((item: any) => ({
          tanggal: new Date(item.waktu_masuk).toLocaleDateString("id-ID"),
          waktuMasuk: new Date(item.waktu_masuk).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          waktuKeluar: item.waktu_keluar
            ? new Date(item.waktu_keluar).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : undefined,
          status: item.status_parkir === "MASUK" ? "Masuk" : "Keluar",
        }));

        setRiwayat(mapped);
      } else {
        setRiwayat([]);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Gagal mengambil riwayat parkir:", error);
        setRiwayat([]);
      }
    } finally {
      setLoadingRiwayat(false);
    }
  }, []);

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchRef.current = fetchStatCard;
    riwayatRef.current = fetchRiwayatParkir;
  }, [fetchStatCard, fetchRiwayatParkir]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStatCard(controller.signal);
    fetchRiwayatParkir(controller.signal);
    return () => controller.abort();
  }, [fetchStatCard, fetchRiwayatParkir]);

  useEffect(() => {
    console.log("🔌 Initializing socket for Informasi Parkir...");
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Informasi Parkir Socket Connected to:", socketHost);
      console.log("🆔 Socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Informasi Parkir Socket Disconnected:", reason);
    });

    socket.on("parking_update", (payload: any) => {
      console.log("🚗 Informasi Parkir real-time update:", payload);
      console.log("🔄 Refreshing statcard and riwayat...");
      if (fetchRef.current) fetchRef.current();
      if (riwayatRef.current) riwayatRef.current();
    });

    socket.on("user_update", (payload: any) => {
      console.log("👥 User update received:", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Informasi Parkir Socket Error:", err.message);
    });

    return () => {
      console.log("🔌 Disconnecting Informasi Parkir socket...");
      socket.disconnect();
    };
  }, []);

  /* ================= REFRESH ================= */
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStatCard(), fetchRiwayatParkir()]);
    setLoading(false);
  };

  const statusParkir = statcard.tersedia === 0 ? "Penuh" : "Tersedia";

  return (
    <div className="space-y-8">
      {/* STATUS PARKIR */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-gray-700">Status Parkir:</span>
        <span
          className={`rounded px-3 py-1 text-xs font-semibold text-white ${statusParkir === "Penuh" ? "bg-red-600" : "bg-green-600"
            }`}
        >
          {statusParkir}
        </span>
      </div>

      {/* STATCARD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Ketersediaan Parkir
          </h3>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Terisi" value={statcard.terisi} unit="Kendaraan" />
          <StatCard title="Tersedia" value={statcard.tersedia} unit="Slot" />
          <StatCard
            title="Kesempatan Parkir"
            value={statcard.kesempatan_parkir}
            unit="Kali"
          />
        </div>
      </section>

      {/* RIWAYAT PARKIR */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">
          Riwayat Parkir Anda
        </h3>

        {loadingRiwayat ? (
          <p className="text-xs text-gray-500">Memuat riwayat...</p>
        ) : riwayat.length > 0 ? (
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <Th>Tanggal</Th>
                <Th>Waktu Masuk</Th>
                <Th>Waktu Keluar</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((item, index) => (
                <tr key={index} className="border-t text-center">
                  <Td>{item.tanggal}</Td>
                  <Td>{item.waktuMasuk}</Td>
                  <Td>{item.waktuKeluar ?? "-"}</Td>
                  <Td>{item.status}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-gray-500">Belum ada riwayat parkir</p>
        )}
      </section>
    </div>
  );
}

/* ===== TABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-xs font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-xs">{children}</td>;
}
