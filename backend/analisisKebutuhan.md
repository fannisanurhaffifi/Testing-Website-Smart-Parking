

# README – Analisis Kebutuhan Fungsional

## Sistem Informasi Monitoring Smart Parking

---

## Daftar Isi

* [Pendahuluan](#pendahuluan)
* [Kebutuhan Fungsional](#kebutuhan-fungsional)

  * [Prioritas Tinggi](#prioritas-tinggi)
  * [Prioritas Sedang](#prioritas-sedang)
* [Aktor Sistem](#aktor-sistem)
* [Kategori Fitur](#kategori-fitur)
* [Ringkasan Prioritas](#ringkasan-prioritas)
* [Catatan Implementasi](#catatan-implementasi)

---

## Pendahuluan

Dokumen ini berisi **analisis kebutuhan fungsional** dari **Sistem Informasi Monitoring Smart Parking** yang dikembangkan berbasis **Node.js dan MySQL**, dengan studi kasus **Jurusan Teknik Geodesi Fakultas Teknik Universitas Lampung**.

Analisis kebutuhan disusun berdasarkan:

* **Entity Relationship Diagram (ERD)** sistem smart parking
* **Hasil requirement planning** (wawancara dan kuesioner)
* **Alur bisnis sistem parkir berbasis IoT (RFID)**

Sistem ini berfokus pada **pengelolaan data parkir, monitoring ketersediaan slot, pencatatan log masuk–keluar kendaraan, serta pengaturan kuota parkir** secara real-time melalui backend.

---

## Kebutuhan Fungsional

### Prioritas Tinggi

#### KF-01: Registrasi Pengguna

**Deskripsi:**
Sistem menyediakan fitur pendaftaran akun pengguna parkir dengan data identitas dan kendaraan.

**Aktor:** Pengguna V

**Parameter Utama:**

* NPM
* Nama
* Profile
* Email
* Angkatan
* Jurusan
* Password
* Data kendaraan (plat nomor, jenis kendaraan)

**Input/Output:**

* Input: Form registrasi pengguna
* Output: Akun tersimpan dengan status menunggu verifikasi

---

#### KF-02: Login Pengguna

**Deskripsi:**
Sistem menyediakan autentikasi login dan logout untuk admin maupun pengguna.

**Aktor:**  Pengguna V

**Parameter Utama:**

* Username / NPM
* Password
* Status akun

**Input/Output:**

* Input: Kredensial login
* Output: Akses ke sistem sesuai peran

---

### KF-02: Login Admin Sistem

**Deskripsi:**
Admin dapat melakukan login ke dalam sistem menggunakan akun yang sudah tersedia secara default di sistem. Admin tidak perlu melakukan registrasi, karena akun admin dibuat otomatis saat sistem diinisialisasi.

Aktor: Admin V

Parameter Utama:

Username admin

Password admin

Status login

Input/Output:

Input: Username dan password admin

Output: Akses dashboard admin atau pesan gagal login

--
#### KF-03: Verifikasi Akun Pengguna

**Deskripsi:**
Admin memverifikasi akun pengguna sebelum diberikan akses penuh ke sistem.

**Aktor:** Admin V

**Parameter Utama:**

* NPM pengguna
* Status akun (Aktif / Nonaktif)
* Tanggal verifikasi

**Input/Output:**

* Input: Aksi verifikasi admin
* Output: Status akun terbarui

---

#### KF-04: Pengelolaan Data Kendaraan

**Deskripsi:**
Sistem menyimpan dan mengelola data kendaraan milik pengguna.

**Aktor:** Pengguna

**Parameter Utama:**

* ID kendaraan
* Plat nomor
* Jenis kendaraan
* STNK

**Input/Output:**

* Input: Data kendaraan
* Output: Kendaraan terdaftar di sistem

---

#### KF-05: Manajemen RFID Kendaraan

**Deskripsi:**
Sistem mengelola data RFID sebagai identitas utama kendaraan parkir.

**Aktor:** Admin V

**Parameter Utama:**

* Kode RFID
* Status RFID
* Tanggal aktif
* Kendaraan terhubung

**Input/Output:**

* Input: Data RFID
* Output: RFID terasosiasi dengan kendaraan

---

#### KF-06: Pencatatan Log Parkir Masuk

**Deskripsi:**
Sistem mencatat waktu masuk kendaraan secara otomatis berdasarkan pembacaan RFID.

**Aktor:** Sistem (IoT), Admin

**Parameter Utama:**

* ID kendaraan
* Waktu masuk
* Status parkir

**Input/Output:**

* Input: Data RFID dari perangkat IoT
* Output: Log parkir masuk tersimpan

---

#### KF-07: Pencatatan Log Parkir Keluar

**Deskripsi:**
Sistem mencatat waktu keluar kendaraan dan memperbarui status parkir.

**Aktor:** Sistem (IoT), Admin

**Parameter Utama:**

* ID kendaraan
* Waktu keluar
* Status parkir

**Input/Output:**

* Input: Data RFID keluar
* Output: Log parkir diperbarui

---

#### KF-08: Monitoring Ketersediaan Slot Parkir

**Deskripsi:**
Sistem menampilkan jumlah slot parkir tersedia dan terpakai secara real-time.

**Aktor:** Pengguna, Admin

**Parameter Utama:**

* Jumlah slot total
* Jumlah slot terpakai
* Slot tersedia

**Input/Output:**

* Input: Data log parkir
* Output: Informasi ketersediaan parkir

---

#### KF-09: Pengelolaan Kuota Parkir

**Deskripsi:**
Sistem mengatur dan memperbarui kuota parkir berdasarkan aktivitas kendaraan.

**Aktor:** Admin (perlu revisi untuk di buat per pengguna)

**Parameter Utama:**

* Batas parkir
* Jumlah terpakai
* Sisa kuota

**Input/Output:**

* Input: Konfigurasi kuota
* Output: Kuota terupdate otomatis

---

#### KF-10: Monitoring Statistik Parkir

**Deskripsi:**
Sistem menyajikan statistik parkir dalam bentuk grafik atau tabel.

**Aktor:** Admin v

**Parameter Utama:**

* Jumlah kendaraan parkir
* Durasi parkir
* Riwayat parkir

**Input/Output:**

* Input: Data log parkir
* Output: Statistik parkir

---

### Prioritas Sedang

#### KF-11: Pengelolaan Slot Parkir

**Deskripsi:**
Admin mengatur jumlah slot parkir yang tersedia.

**Aktor:** Admin V

---

#### KF-12: Pengelolaan Akun Pengguna

**Deskripsi:**
Admin dapat menghapus akun pengguna.

**Aktor:** Admin V

---

#### KF-13: Edit Profil Pengguna

**Deskripsi:**
Pengguna dapat memperbarui data akun dan kendaraan.

**Aktor:** Pengguna

---

#### KF-14: Riwayat Parkir Pengguna

**Deskripsi:**
Pengguna dapat melihat riwayat parkir miliknya.

**Aktor:** Pengguna

---

## Aktor Sistem

| Aktor                 | Deskripsi                                                     |
| --------------------- | ------------------------------------------------------------- |
| **Admin**             | Mengelola sistem, memverifikasi akun, mengatur kuota dan slot |
| **Pengguna**          | Mengakses informasi parkir dan menggunakan fasilitas parkir   |
| **Sistem IoT (RFID)** | Mengirim data masuk–keluar kendaraan secara otomatis          |

---

## Kategori Fitur

### 1. Manajemen Pengguna

* KF-01, KF-02, KF-03, KF-12, KF-13

### 2. Manajemen Kendaraan & RFID

* KF-04, KF-05

### 3. Monitoring Parkir

* KF-06, KF-07, KF-08, KF-10, KF-14

### 4. Manajemen Slot & Kuota

* KF-09, KF-11

---

## Ringkasan Prioritas

| Prioritas  | Jumlah Kebutuhan | Kode KF         |
| ---------- | ---------------- | --------------- |
| **Tinggi** | 10               | KF-01 s.d KF-10 |
| **Sedang** | 4                | KF-11 s.d KF-14 |

---

## Catatan Implementasi

1. Sistem menggunakan **Node.js REST API**
2. Database dirancang berdasarkan **ERD Smart Parking**
3. Data log parkir **dipicu otomatis oleh RFID**
4. Backend mendukung **monitoring real-time**
5. Pengujian dilakukan menggunakan **Black Box Testing**
6. Sistem mendukung integrasi **IoT tanpa pengolahan hardware**


