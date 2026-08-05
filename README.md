# Sistem Manajemen Sengketa & Perkara (Web BPN)

Aplikasi berbasis web untuk mendukung digitalisasi, pengelolaan, dan pengarsipan dokumen terkait Sengketa dan Perkara di lingkungan Kementerian ATR/BPN. Sistem ini dirancang untuk mempermudah pelacakan dokumen dan memisahkan alur kerja penanganan sengketa dan perkara dalam satu platform yang terpusat.

## Fungsi Utama

- **Pusat Informasi Dokumen:** Membantu pegawai melihat status terkini dari setiap dokumen yang masuk, sedang diproses, atau sudah selesai.
- **Manajemen Arsip Digital:** Mengurangi ketergantungan pada berkas fisik dengan menyediakan penyimpanan digital yang mudah dicari dan disaring berdasarkan parameter tertentu.
- **Pembagian Peran Pegawai:** Mengatur hak akses secara spesifik agar data dan pengaturan sensitif hanya bisa diakses oleh pihak yang berwenang.

## Fitur Aplikasi

- **Dashboard Terintegrasi:** Menampilkan metrik operasional, ringkasan jadwal sidang, dan grafik analitik singkat.
- **Penyimpanan Digital:** Ruang unggah dokumen (PDF, Word, JPG) yang dilengkapi dengan status penanganan.
- **Role-Based Access Control (RBAC):** Sistem manajemen pengguna yang memisahkan hak akses antara `Admin` dan `Staff`.
- **Ekspor Laporan:** Fasilitas untuk mengunduh rekapitulasi data antrean ke dalam format *spreadsheet*.

## Teknologi yang Digunakan

Aplikasi ini dikembangkan dengan arsitektur modern menggunakan teknologi berikut:

- **Antarmuka Pengguna (Frontend):** React.js, TypeScript, Vite, dan Tailwind CSS.
- **Server (Backend):** Node.js dan Express.js.
- **Database:** PostgreSQL.
- **Lainnya:** RESTful API untuk komunikasi data antara klien dan server.
