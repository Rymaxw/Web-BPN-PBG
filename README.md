# Sistem Manajemen Sengketa & Perkara (ATR/BPN)

Aplikasi web modern untuk mengelola, menganalisis, dan mengarsipkan dokumen terkait Sengketa dan Perkara pertanahan di lingkungan Kementerian ATR/BPN (khususnya percontohan Kantor Pertanahan Kab. Purbalingga).

Sistem ini dirancang agar pencarian dokumen lebih cepat, alur kerja lebih rapi, dan meminimalisir risiko kehilangan berkas fisik.

---

## 🎯 Tujuan & Fungsi Utama
- **Digitalisasi Berkas:** Mengubah tumpukan map fisik menjadi arsip digital yang rapi dan mudah dicari kapan saja.
- **Manajemen Terpusat:** Memisahkan alur kerja antara **Sengketa** dan **Perkara** dalam satu pintu (dashboard).
- **Pemantauan Status:** Memantau berkas mana yang sedang diproses, sudah selesai, atau bermasalah (error).
- **Keamanan Data:** Membatasi hak akses antara pegawai biasa (Staff) dan administrator (Admin).

---

## ✨ Fitur Unggulan
1. **Dashboard Cerdas:** Menampilkan statistik total perkara/sengketa, jadwal sidang terdekat, dan grafik tren masuknya dokumen.
2. **Arsip Digital:** Ruang penyimpanan dokumen PDF/Word/JPG dengan fitur pencarian cepat dan penyaringan (filter) berdasarkan tanggal/status.
3. **Role-Based Access Control (RBAC):**
   - **Admin:** Bisa mengakses semua fitur, termasuk menu *Manajemen Pengguna* untuk mengubah jabatan akun lain.
   - **Staff:** Bisa mengelola dokumen, namun tidak bisa mengakses pengaturan sensitif (Manajemen Pengguna disembunyikan).
4. **Analisis AI (Simulasi):** Antarmuka yang menampilkan hasil ekstraksi data dari dokumen legal secara otomatis.
5. **Ekspor Laporan:** Mengunduh data antrean berkas dalam format Excel/PDF.

---

## 🛠️ Teknologi yang Digunakan
Aplikasi ini dibangun menggunakan arsitektur *Client-Server* (Frontend & Backend terpisah).

**Frontend (Antarmuka Pengguna):**
- [React.js](https://react.dev/) + TypeScript
- [Vite](https://vitejs.dev/) (Build tool super cepat)
- [Tailwind CSS](https://tailwindcss.com/) (Styling UI)
- React Router DOM (Navigasi halaman)

**Backend (Server & Database):**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (API Server)
- [Prisma ORM](https://www.prisma.io/) (Manajemen Database)
- [Supabase / PostgreSQL](https://supabase.com/) (Database Cloud)
- JWT & bcryptjs (Keamanan dan Autentikasi)

---

## 🚀 Panduan Menjalankan di Komputer Lokal (Local Setup)

Buat kamu (atau teman tim) yang mau *pull* repo ini dan menjalankannya di laptop sendiri, ikuti langkah-langkah wajib di bawah ini:

### Persyaratan Sistem (Prerequisites)
Pastikan laptop kamu sudah ter-install:
- **Node.js** (versi 18 atau terbaru)
- **Git**

### 1. Kloning Repository
Buka terminal/CMD dan jalankan:
```bash
git clone <url-repo-github-ini>
cd Web-BPN
```

### 2. Setup Backend (Server)
Buka terminal baru, lalu masuk ke folder backend:
```bash
cd backend
npm install
```

**Konfigurasi Database:**
Buat file bernama `.env` di dalam folder `backend/`, lalu isi dengan *Connection String* Supabase kita:
```env
DATABASE_URL="postgresql://postgres.[ID_SUPABASE]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ID_SUPABASE]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
PORT=3000
```
*(Minta kredensial asli ke pembuat repository jika kamu belum punya).*

**Sinkronisasi Prisma:**
Jalankan perintah ini agar Prisma terhubung ke database:
```bash
npx prisma generate
```

**Jalankan Server Backend:**
```bash
npm run dev
```
*Backend akan berjalan di `http://localhost:3000`.*

### 3. Setup Frontend (Tampilan Web)
Buka terminal baru lagi (biarkan terminal backend tetap jalan), lalu masuk ke folder frontend:
```bash
cd frontend
npm install
```

**Konfigurasi API:**
Buat file bernama `.env` di dalam folder `frontend/` dan isi dengan:
```env
VITE_API_URL=http://localhost:3000/api
```

**Jalankan Server Frontend:**
```bash
npm run dev
```
*Web akan terbuka otomatis di browser pada alamat `http://localhost:5173`.*

---

## 👥 Cara Login (Akun Bawaan)
Jika database belum di-reset, kamu bisa menggunakan akun admin bawaan berikut untuk mencoba aplikasi:
- **Email:** admin@bpn.go.id
- **Password:** admin123

Atau, kamu bisa langsung klik tulisan **"Daftar di sini"** di halaman Login untuk membuat akun *Staff* kamu sendiri secara instan!

---
*Dibuat untuk memudahkan pelayanan dan birokrasi pertanahan di Indonesia.* 🇮🇩
