-- =========================
-- DATABASE
-- =========================

show databases;

CREATE DATABASE IF NOT EXISTS parkir_db;

drop database if exists parkir_db;

USE parkir_db;

-- =========================
-- TABEL PENGGUNA
-- =========================
CREATE TABLE pengguna (
    npm VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE,
    jurusan VARCHAR(100) NOT NULL,
    prodi VARCHAR(100) NOT NULL,
    angkatan VARCHAR(50) NOT NULL,
    foto VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status_akun BOOLEAN DEFAULT FALSE,
    tanggal_daftar DATETIME
);

-- =========================
-- TABEL ADMIN
-- =========================
CREATE TABLE admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- =========================
-- TABEL KENDARAAN
-- =========================
CREATE TABLE kendaraan (
    id_kendaraan INT AUTO_INCREMENT PRIMARY KEY,
    npm VARCHAR(50) NOT NULL,
    plat_nomor VARCHAR(20) NOT NULL,
    jenis_kendaraan BOOLEAN,
    stnk VARCHAR(255),
    CONSTRAINT fk_kendaraan_pengguna
        FOREIGN KEY (npm)
        REFERENCES pengguna(npm)
        ON DELETE CASCADE
);

-- =========================
-- TABEL RFID
-- =========================
CREATE TABLE rfid (
    id_rfid INT AUTO_INCREMENT PRIMARY KEY,
    id_kendaraan INT NOT NULL,
    kode_rfid VARCHAR(50) UNIQUE NOT NULL,
    status_rfid BOOLEAN DEFAULT TRUE,
    tanggal_aktif DATETIME,
    CONSTRAINT fk_rfid_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan)
        ON DELETE CASCADE
);

-- =========================
-- TABEL SLOT PARKIR
-- =========================
CREATE TABLE slot_parkir (
    id_slot INT AUTO_INCREMENT PRIMARY KEY,
    jumlah INT,
    id_admin INT,
    CONSTRAINT fk_slot_admin
        FOREIGN KEY (id_admin)
        REFERENCES admin(id_admin)
);

-- =========================
-- TABEL KUOTA PARKIR
-- =========================
CREATE TABLE kuota_parkir (
    id_kuota INT AUTO_INCREMENT PRIMARY KEY,
    npm VARCHAR(50),
    id_kendaraan INT,
    periode_bulan VARCHAR(7), -- Format: YYYY-MM
    batas_parkir INT NOT NULL DEFAULT 0,
    jumlah_terpakai INT DEFAULT 0,
    id_admin INT,
    CONSTRAINT fk_kuota_admin
        FOREIGN KEY (id_admin)
        REFERENCES admin(id_admin),
    CONSTRAINT fk_kuota_pengguna
        FOREIGN KEY (npm)
        REFERENCES pengguna(npm)
        ON DELETE CASCADE,
    CONSTRAINT fk_kuota_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan)
        ON DELETE CASCADE,
    UNIQUE KEY (id_kendaraan, periode_bulan)
);

-- =========================
-- TABEL LOG PARKIR
-- =========================
CREATE TABLE log_parkir (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_kendaraan INT NOT NULL,
    waktu_masuk DATETIME NOT NULL,
    waktu_keluar DATETIME,
    status_parkir ENUM('MASUK','KELUAR') NOT NULL,
    id_kuota INT,
    CONSTRAINT fk_log_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan),
    CONSTRAINT fk_log_kuota
        FOREIGN KEY (id_kuota)
        REFERENCES kuota_parkir(id_kuota)
);

-- Tabel OTP

CREATE TABLE reset_password_otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expired_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfid_registration_session (
    id_session INT AUTO_INCREMENT PRIMARY KEY,
    id_kendaraan INT NOT NULL,
    id_admin INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME,
    status ENUM('PENDING','DONE','EXPIRED') DEFAULT 'PENDING',
    CONSTRAINT fk_session_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan)
        ON DELETE CASCADE,
    CONSTRAINT fk_session_admin
        FOREIGN KEY (id_admin)
        REFERENCES admin(id_admin)
        ON DELETE CASCADE
);