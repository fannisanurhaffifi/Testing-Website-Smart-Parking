"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Periode = "harian" | "mingguan" | "bulanan";

type StatistikKendaraanProps = {
  refreshKey?: number;
};

export default function StatistikKendaraan({
  refreshKey = 0,
}: StatistikKendaraanProps) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchStatistik = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ periode });

        if (periode === "harian" && filterDate) {
          params.append("date", filterDate);
        } else if (periode === "mingguan") {
          if (fromDate) params.append("from", fromDate);
          if (toDate) params.append("to", toDate);
        } else if (periode === "bulanan" && filterDate) {
          params.append("date", filterDate);
        }

        const res = await fetch(
          `/api/statistik/kendaraan?${params.toString()}`,
          { cache: "no-store" }
        );

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data statistik");
        }

        setLabels(result.labels ?? []);
        setValues(result.data ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistik();
  }, [periode, refreshKey, filterDate, fromDate, toDate]);

  /* ================= CHART DATA ================= */
  const chartData = {
    labels,
    datasets: [
      {
        label: "Jumlah Kendaraan",
        data: values,
        backgroundColor: "#1F3A93",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="rounded-lg bg-gray-200 p-3 md:p-4">
      {/* HEADER */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-xs md:text-sm font-semibold">
          Statistik Kendaraan
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {(periode === "harian" || periode === "bulanan") && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded border px-2 py-1 text-[10px] md:text-xs"
            />
          )}

          {periode === "mingguan" && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded border px-2 py-1 text-[10px] md:text-xs"
              />
              <span className="text-[10px]">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded border px-2 py-1 text-[10px] md:text-xs"
              />
            </div>
          )}

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as Periode)}
            className="rounded border bg-white px-2 py-1 text-[10px] md:text-xs"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>
      </div>

      {/* CONTENT */}
      <div className="h-[250px] md:h-[320px]">
        {loading && (
          <p className="text-center text-xs text-gray-500">
            Memuat data statistik...
          </p>
        )}

        {error && (
          <p className="text-center text-xs text-red-500">{error}</p>
        )}

        {!loading && !error && labels.length > 0 && (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.parsed.y} kendaraan`,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    autoSkip: false, // Tampilkan 24 jam/hari/bulan di sumbu X
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                      size: 9,
                      weight: "bold",
                    },
                    color: "#374151",
                  },
                  grid: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: periode === "harian" ? "Waktu (24 Jam)" : "Periode",
                    font: { size: 12, weight: "bold" },
                  },
                },
                y: {
                  beginAtZero: true,
                  suggestedMax: 100, // Menghindari skala hanya mengikuti data tertinggi
                  ticks: {
                    stepSize: 10, // Kelipatan 10 di sumbu Y
                    precision: 0,
                  },
                  title: {
                    display: true,
                    text: "Jumlah Kendaraan",
                    font: { size: 12, weight: "bold" },
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
