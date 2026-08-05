# Web BPN - Sistem Manajemen Sengketa & Perkara

Sistem informasi berbasis web untuk digitalisasi, pengelolaan, dan pengarsipan dokumen terkait Sengketa dan Perkara di lingkungan Kementerian ATR/BPN. Sistem ini memfasilitasi pemisahan alur kerja sengketa dan perkara dalam satu platform terpusat.

## Fitur Utama

- **Dashboard Terintegrasi:** Menampilkan metrik utama, grafik tren dokumen, dan ringkasan jadwal sidang.
- **Arsip Digital:** Penyimpanan dokumen terpusat dengan kemampuan pencarian dan penyaringan data secara real-time.
- **Role-Based Access Control (RBAC):** Pemisahan hak akses antara `Admin` (pengelola sistem & pengguna) dan `Staff` (pengelola dokumen).
- **Ekspor Data:** Fitur pembuatan laporan antrean dalam format spreadsheet.
- **UI/UX Modern:** Antarmuka responsif yang dibangun menggunakan komponen modern berbasis Tailwind CSS.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Supabase), Prisma ORM.
- **Security:** JWT (JSON Web Tokens), bcryptjs.

---

## Petunjuk Instalasi (Local Development)

Berikut adalah langkah-langkah untuk menjalankan aplikasi ini di environment lokal.

### Persyaratan Sistem
- Node.js (v18 atau lebih baru)
- npm atau pnpm
- Git

### 1. Kloning Repositori

```bash
git clone https://github.com/Rymaxw/Web-BPN-PBG.git
cd Web-BPN-PBG
```

### 2. Konfigurasi Backend

Masuk ke direktori backend dan instal dependensi:

```bash
cd backend
npm install
```

Buat file `.env` di dalam direktori `backend/` dan sesuaikan nilainya dengan kredensial database Supabase Anda:

```env
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
PORT=3000
```

Sinkronisasi skema database dengan Prisma dan jalankan server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```
*Server backend akan berjalan di port 3000.*

### 3. Konfigurasi Frontend

Buka terminal/tab baru, masuk ke direktori frontend dan instal dependensi:

```bash
cd ../frontend
npm install
```

Buat file `.env` di dalam direktori `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan server *development* frontend:

```bash
npm run dev
```
*Aplikasi web dapat diakses melalui http://localhost:5173.*

---

## Autentikasi Bawaan (Default Credentials)

Untuk keperluan pengujian, sistem menyediakan satu akun Administrator bawaan:
- **Email:** `admin@bpn.go.id`
- **Password:** `admin123`

Untuk menambahkan pengguna baru, gunakan fitur registrasi pada halaman Login. Akun yang baru terdaftar akan otomatis memiliki role `staff` dan dapat dinaikkan menjadi `admin` melalui menu Pengaturan.
