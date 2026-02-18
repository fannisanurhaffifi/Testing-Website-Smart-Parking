"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { CheckCircle } from "lucide-react";

/* ================= DATA JURUSAN ================= */

const jurusanList = [
  "Jurusan Teknik Sipil",
  "Jurusan Teknik Mesin",
  "Jurusan Teknik Elektro",
  "Jurusan Teknik Geofisika",
  "Jurusan Teknik Kimia",
  "Jurusan Teknik Geodesi dan Geomatika",
  "Jurusan Teknik Arsitektur",
];

const prodiByJurusan: Record<string, string[]> = {
  "Jurusan Teknik Sipil": [
    "Program Studi S1 Teknik Sipil",
    "Program Studi S1 Teknik Lingkungan",
    "Program Studi Magister Teknik Sipil",
  ],
  "Jurusan Teknik Mesin": [
    "Program Studi S1 Teknik Mesin",
    "Program Studi S1 Terapan Rekayasa Otomotif",
    "Program Studi Magister Teknik Mesin",
    "Program Studi Diploma 3 Teknik Mesin",
  ],
  "Jurusan Teknik Elektro": [
    "Program Studi S1 Teknik Elektro",
    "Program Studi S1 Teknik Informatika",
    "Program Studi Magister Teknik Elektro",
  ],
  "Jurusan Teknik Geofisika": ["Program Studi S1 Teknik Geofisika"],
  "Jurusan Teknik Kimia": ["Program Studi S1 Teknik Kimia"],
  "Jurusan Teknik Geodesi dan Geomatika": [
    "Program Studi S1 Teknik Geodesi",
    "Program Studi Diploma 3 Teknik Survey dan Pemetaan",
  ],
  "Jurusan Teknik Arsitektur": [
    "Program Studi S1 Arsitektur",
    "Program Studi Diploma 3 Arsitek Bangunan Gedung (D3 ABG)",
  ],
};

export default function ProfilMahasiswaPage() {
  const [profil, setProfil] = useState<any>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */

  const fetchRef = useRef<any>(null);

  const fetchProfil = useCallback(async (signal?: AbortSignal) => {
    const npm = localStorage.getItem("npm");
    if (!npm) return;

    try {
      const res = await fetch(`/api/users/profile?npm=${npm}`, { signal });
      const data = await res.json();

      if (res.ok) {
        setProfil(data.data);

        if (data.data?.foto) {
          setPreviewFoto(
            `${process.env.NEXT_PUBLIC_API_URL}/uploads/${data.data.foto}`
          );
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("FETCH PROFIL ERROR:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchRef.current = fetchProfil;
  }, [fetchProfil]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfil(controller.signal);
    return () => controller.abort();
  }, [fetchProfil]);

  // Socket Listener for Status Update
  useEffect(() => {
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost);

    socket.on("user_update", (payload: any) => {
      console.log("👥 Profil real-time update:", payload);
      const myNpm = localStorage.getItem("npm");
      if (payload.npm === myNpm || !payload.npm) {
        if (fetchRef.current) fetchRef.current();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!profil) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Memuat data...
      </div>
    );
  }

  /* ================= HANDLERS ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setProfil((prev: any) => ({
      ...prev,
      [name]: value,
      ...(name === "jurusan" ? { prodi: "" } : {}),
    }));
  };

  const handleFotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoFile(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("npm", profil.npm);
      formData.append("jurusan", profil.jurusan || "");
      formData.append("prodi", profil.prodi || "");
      formData.append("angkatan", profil.angkatan || "");
      formData.append("plat_nomor", profil.plat_nomor || "");
      if (fotoFile) formData.append("foto", fotoFile);

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        await fetchProfil(); // Segarkan data
        setShowToast(true);
        // Hide toast after 3 seconds
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("SAVE PROFIL ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan profil");
    } finally {
      setSaving(false);
    }
  };


  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col items-center gap-4 pb-6">

        <div
          className="rounded-full border-2 border-[#1F3A93] overflow-hidden bg-white flex-shrink-0"
          style={{ width: '114px', height: '114px', minWidth: '114px', minHeight: '114px', maxWidth: '114px', maxHeight: '114px' }}
        >
          {previewFoto ? (
            <img
              src={previewFoto}
              alt="Foto Profil"
              className="object-cover"
              style={{ width: '114px', height: '114px' }}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>

        <input
          id="uploadFoto"
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          hidden
        />

        <label
          htmlFor="uploadFoto"
          className="cursor-pointer  text-xs font-semibold text-[#1F3A93] transition"
        >
          Ubah Foto
        </label>

        <div
          className={`rounded-full px-2 py-1 text-xs font-bold ${profil.status_akun === 1
            ? "bg-green-100 text-green-700"
            : profil.status_akun === 2
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {profil.status_akun === 1
            ? "Akun Aktif"
            : profil.status_akun === 2
              ? "Akun Diblokir"
              : "Menunggu Verifikasi"}
        </div>
      </div>

      {/* ================= INFORMASI ================= */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 border-b pb-1 mb-3">
          Informasi Profil
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nama Lengkap" value={profil.nama} disabled />
          <Field label="NPM" value={profil.npm} disabled />

          <Field label="Email" value={profil.email} disabled />
          <Field label="Nomor Kendaraan" value={profil.plat_nomor} disabled />
          <Field
            label="Angkatan"
            name="angkatan"
            value={profil.angkatan || ""}
            onChange={handleChange}
          />

          <Select
            label="Jurusan"
            name="jurusan"
            value={profil.jurusan}
            onChange={handleChange}
            options={jurusanList}
          />

          <Select
            label="Program Studi"
            name="prodi"
            value={profil.prodi}
            onChange={handleChange}
            options={prodiByJurusan[profil.jurusan] || []}
            disabled={!profil.jurusan}
          />
        </div>
      </section>
      {/* ================= STNK ================= */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-800 border-b pb-2">
          Lampiran STNK
        </h2>
        {profil.stnk ? (
          <div className="mt-4 flex flex-col items-start gap-4">
            <div className="relative h-40 w-64 overflow-hidden rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md">
              <img
                src={`${apiBase}/uploads/${profil.stnk}`}
                alt="STNK"
                className="h-full w-full object-contain bg-gray-50"
              />
            </div>
            <a
              href={`${apiBase}/uploads/${profil.stnk}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
            >
              Buka Gambar Penuh ↗
            </a>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Belum ada lampiran STNK</p>
        )}
      </div>

      {/* ================= GANTI PASSWORD ================= */}
      <section className="mt-8 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 border-b pb-1">
          Ganti Kata Sandi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Kata Sandi Baru"
            type="password"
            name="password_baru"
          />
          <Field
            label="Konfirmasi Kata Sandi"
            type="password"
            name="konfirmasi_password"
          />
        </div>
      </section>


      {/* ================= BUTTON ================= */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-[#1F3A93] px-5 py-2 text-xs font-semibold text-white hover:bg-[#162C6E] transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {/* ================= TOAST NOTIFICATION ================= */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-500/20">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">Informasi profil berhasil diperbarui!</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= FIELD ================= */

function Field({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        {...props}
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs bg-white"
      >
        <option value="">Pilih</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
