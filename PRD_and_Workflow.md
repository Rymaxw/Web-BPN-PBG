# Product Requirements Document (PRD): Sistem Manajemen Sengketa & Perkara ATR/BPN

## 1. Ringkasan Proyek
Aplikasi berbasis web untuk Kementerian ATR/BPN (khususnya Kantor Pertanahan Kab. Purbalingga) yang berfungsi untuk mengelola Sengketa (Pengaduan) dan Perkara (Pengadilan). Sistem ini mencakup pelacakan surat/dokumen, analisis dokumen menggunakan AI/OCR, manajemen arsip digital, dan pelaporan terintegrasi.

## 2. Fitur Utama

### 2.1. Dashboard Utama
*   **Konteks Ganda:** Terdapat dropdown untuk beralih antara modul "Sengketa (Pengaduan)" dan "Perkara (Pengadilan)".
*   **Metrik Kunci:** Menampilkan total pengaduan aktif, sengketa berjalan, rata-rata respon (SLA), distribusi beban kerja, dan status antrean.
*   **Antrean Berkas:** Daftar berkas yang memerlukan atensi (Siap Review, Panggilan Sidang, Berkas Kurang) beserta indikator batas waktu (deadline).
*   **Grafik Tren:** Perbandingan volume masuk harian antara Sengketa dan Perkara.

### 2.2. Manajemen Surat & Tracking
*   **Alur Pelacakan (Timeline):** Visualisasi tahapan dokumen (Front Office -> Verifikasi Berkas -> Review -> Penandatanganan -> Surat Balasan).
*   **Peringatan SLA:** Peringatan visual (merah) jika dokumen mendekati atau melewati batas waktu.
*   **Ubah Status Dokumen:** Form untuk memperbarui status (Selesai, Sedang Berjalan, Mendekati Deadline, Ditolak/Butuh Revisi) disertai catatan.
*   **Kronologi (Log Aktivitas):** Tabel riwayat pergerakan berkas per petugas dan waktu.

### 2.3. Analisis Dokumen (AI & OCR)
*   **Dashboard Analisis:** Menampilkan akurasi model AI, kategori terbanyak, dan live data feed.
*   **Daftar Analisis:** Menampilkan dokumen yang sedang atau telah dianalisis (Proses, Selesai, Error) beserta klasifikasi keamanan (Rahasia, Terbuka, dsb).
*   **Pratinjau Dokumen:** PDF viewer bawaan dengan highlight data hasil ekstraksi AI.

### 2.4. Arsip Digital
*   **Penyimpanan Dokumen:** Repositori untuk semua berkas (PDF, DOCX, JPG) dengan indikator status verifikasi (Tervalidasi AI, Butuh Review).
*   **Filter Lanjutan:** Pencarian spesifik berdasarkan Rentang Waktu, Klasifikasi (Sangat Rahasia, Terbuka), Tipe Sengketa (Batas Tanah, Warisan, Sertifikat Ganda), dan Wilayah Kecamatan.
*   **Unggah Berkas (Secure):** Fitur drag-and-drop dengan form metadata (Nomor Berkas, NIK/NIB, Pemohon). File yang diunggah akan dienkripsi dengan standar keamanan internal (AES-256).

### 2.5. Utilitas & Ekspor
*   **Cetak Kartu Kendali:** Menghasilkan halaman cetak berisi barcode dan detail dokumen untuk pelacakan fisik.
*   **Ekspor Data:** Mengunduh tabel atau laporan analitik ke format Microsoft Excel (.xlsx) atau PDF (.pdf).
*   **Bagikan Dokumen:** Integrasi berbagi via Google Drive, WhatsApp, Email, atau Salin Tautan.

### 2.6. Pengaturan Sistem
*   **Profil Pengguna:** Manajemen data akun admin (Nama, NIP, Jabatan).
*   **Keamanan & Privasi:** Fitur auto-sensor (menyensor NIK/No. HP secara otomatis), log aktivitas login, dan penghapusan riwayat (Zona Berbahaya).

---

# Team Work Flow (Pembagian Sub-Agent)

Sesuai dengan aturan kode yang bersih dan fokus pada *role* spesifik, alur kerja tim akan dibagi ke dalam beberapa Sub-Agent AI:

### 1. 🏗️ System Architect / Planner Agent
*   **Tugas:** Menyusun struktur direktori, menetapkan standar arsitektur (misal: penamaan file, aturan linting), dan memecah PRD menjadi task-task kecil.
*   **Fokus:** Tidak menulis logika fitur, melainkan menjaga agar *blueprint* aplikasi sesuai dengan PRD.

### 2. 🎨 Frontend Developer Agent
*   **Tugas:** Membangun antarmuka pengguna (UI) dari tangkapan layar PDF. Membuat komponen *reusable* (Tombol, Tabel, Modal, Sidebar).
*   **Fokus:** Hanya mengurusi HTML/CSS/React/Next.js. Memastikan UI responsif dan interaktif. Menulis kode yang deklaratif dan mudah dibaca tanpa logika *backend* yang tercampur.

### 3. ⚙️ Backend Developer Agent
*   **Tugas:** Membuat REST/GraphQL API, mengelola logika bisnis seperti enkripsi AES-256, perhitungan SLA, dan integrasi penyimpanan *cloud*.
*   **Fokus:** Menulis *controllers*, *services*, dan tata kelola *routing*. Menghindari urusan tampilan UI.

### 4. 🗄️ Database Administrator (DBA) Agent
*   **Tugas:** Merancang skema database (Tabel Pengguna, Dokumen, Log Aktivitas, Sengketa), membuat *migrations*, dan mengoptimasi *query*.
*   **Fokus:** Menulis *schema ORM* (misal: Prisma/Drizzle) dan menjaga integritas relasi data.

### 5. 🤖 AI / OCR Integration Agent (Opsional)
*   **Tugas:** Menyambungkan aplikasi dengan layanan ekstraksi teks (OCR) untuk fitur "Analisis Dokumen".

---

# Rekomendasi Teknologi (Tech Stack)

### Terkait penggunaan "TX"
Jika yang Anda maksud dengan "TX" adalah **TypeScript (TS)**:
**SANGAT DIREKOMENDASIKAN.** Penggunaan TypeScript sangat sejalan dengan aturan Anda yaitu *"Clean Code"*. TypeScript memberikan fitur *static typing* yang membuat kode jauh lebih mudah dibaca, meminimalisir *bug* saat *runtime*, dan mempermudah developer lain (atau agen lain) untuk mengerti *data flow* (seperti tipe data untuk Surat, Sengketa, dll). 
*(Catatan: Jika "TX" merujuk pada hal lain seperti Tailwind atau tRPC, keduanya juga merupakan pilihan modern yang sangat baik, namun TypeScript adalah kewajiban untuk proyek skala enterprise seperti ini).*

### Rekomendasi Database: PostgreSQL
Untuk proyek dengan data terstruktur seperti manajemen surat, log riwayat, dan pelacakan status, **PostgreSQL** adalah pilihan terbaik.
*   **Alasan:** Sangat andal untuk relasi data yang kompleks (seperti relasi antara Dokumen -> Riwayat Status -> Pengguna). Memiliki tipe data JSONB yang cocok jika suatu saat ada metadata dokumen yang dinamis.
*   **ORM yang disarankan:** Gunakan **Prisma ORM** atau **Drizzle ORM** bersama TypeScript. Ini akan membuat interaksi ke database sangat mudah dibaca tanpa harus menulis *query* SQL manual yang berantakan, sejalan dengan prinsip *clean code* Anda.
