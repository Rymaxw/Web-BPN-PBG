DOKUMENTASI TEKNIS SISTEM INFORMASI MANAJEMEN SENGKETA DAN PERKARA (WEB BPN)

## 1. PENDAHULUAN
Dokumen ini merupakan panduan teknis dan rekayasa perangkat lunak dari Sistem Informasi Manajemen Sengketa dan Perkara Pertanahan (Web BPN). Sistem ini dirancang untuk mendigitalisasi proses registrasi, pemantauan status (Service Level Agreement), analisis, dan pengarsipan dokumen hukum di lingkup badan pertanahan.

---

## 2. ARSITEKTUR SISTEM DAN TEKNOLOGI (TECH STACK)
Sistem diimplementasikan menggunakan arsitektur *Monolithic Fullstack* berbasis lingkungan eksekusi Node.js dengan pembagian ranah (concern) antara *Frontend* dan *Backend API*.

### 2.1. Frontend
*   **Kerangka Kerja (Framework):** React.js dengan *bundler* Vite untuk optimasi kompilasi modul.
*   **Bahasa Pemrograman:** TypeScript, untuk menjamin keamanan tipe data (Type-safety) secara statis selama tahap pengembangan.
*   **Antarmuka Pengguna (UI):** Menggunakan Tailwind CSS sebagai *utility-first framework* guna memfasilitasi desain antarmuka yang dinamis dan responsif.

### 2.2. Backend
*   **Runtime & Framework:** Node.js dipadukan dengan Express.js untuk mendirikan layanan RESTful API.
*   **Pemrosesan Data:** Middleware `multer` digunakan untuk menangani ekstraksi *multipart/form-data* yang mengandung file biner dari antarmuka klien.

### 2.3. Basis Data
*   **Sistem Manajemen Basis Data (DBMS):** PostgreSQL (di-host melalui infrastruktur Supabase).
*   **Object-Relational Mapping (ORM):** Prisma ORM digunakan untuk mendefinisikan skema secara deklaratif dan melakukan abstraksi terhadap kueri SQL.
*   **Spesifikasi Lingkungan Basis Data:**
    *   **Kapasitas Penyimpanan Maksimum:** 500 MB (Skema Tingkat Bebas).
    *   **Alokasi Memori (RAM):** Lingkungan klaster berbagi dengan estimasi kapasitas memori ~1 GB.
    *   **Koneksi Maksimum:** Kapasitas hingga 200 koneksi langsung (*direct connections*). Pgbouncer / *Connection pooling* tersedia pada port 6543, sedangkan port 5432 didedikasikan untuk migrasi/mutasi skema langsung.

### 2.4. Infrastruktur Cloud & Deployment
*   **Platform Pengembang:** Vercel. Digunakan sebagai *hosting* berbasis *Serverless*. Karena batasan lingkungan komputasi tanpa-status (*stateless*) pada Vercel, direktori unggahan sistem berkas tidak dapat mempertahankan data secara persisten. Maka, diputuskan model penyimpanan *Binary Large Object* (BLOB) pada basis data utama untuk menyimpan dokumen digital.

---

## 3. STRUKTUR DIREKTORI PROYEK
Arsitektur repositori menggunakan struktur kode gabungan (Monorepo) yang terbagi menjadi dua ranah utama: `backend` dan `frontend`.

```text
📦 Web-BPN-PBG
 ┣ 📂 backend/
 ┃ ┣ 📂 prisma/
 ┃ ┃ ┗ 📜 schema.prisma
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 routes/
 ┃ ┃ ┃ ┗ 📜 documents.ts
 ┃ ┃ ┗ 📜 index.ts
 ┃ ┗ 📜 package.json
 ┣ 📂 frontend/
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 pages/
 ┃ ┃ ┃ ┣ 📜 Dashboard.tsx
 ┃ ┃ ┃ ┣ 📜 ManajemenSurat.tsx
 ┃ ┃ ┃ ┣ 📜 AnalisisDokumen.tsx
 ┃ ┃ ┃ ┗ 📜 ArsipDigital.tsx
 ┃ ┃ ┣ 📜 App.tsx
 ┃ ┃ ┗ 📜 index.css
 ┃ ┣ 📜 vite.config.ts
 ┃ ┗ 📜 package.json
 ┗ 📜 README.md
```

### 3.1. Direktori Backend (`/backend`)
*   **`/prisma`**: Direktori spesifik untuk konfigurasi Object-Relational Mapping (ORM).
    *   `schema.prisma`: Berkas krusial pendefinisian entitas basis data (Tabel `Document`). File ini menjadi referensi utama migrasi tabel PostgreSQL dan abstraksi tipe data TypeScript (termasuk kolom biner `bytea`).
*   **`/src`**: Direktori *source code* utama untuk layanan API Express.js.
    *   **`/routes`**: Modul pembagian (routing) endpoint API.
        *   `documents.ts`: Modul yang mengkapsulasi seluruh operasi CRUD dokumen, filtrasi tipe arsip, mutasi state dokumen (proses/error/selesai), serta metode transmisi streaming objek biner (PDF file) ke *client-side*.
    *   `index.ts`: Modul *entry point* (titik masuk) eksekusi *server*. Berfungsi menginisialisasi Express, mengkonfigurasi kapabilitas *Cross-Origin Resource Sharing* (CORS), dan me-*mount* rute `documents`.
*   `package.json`: Konfigurasi dependensi *backend*, *scripting* pengembangan, dan parameter eksekusi produksi (seperti instruksi kompilasi tsc).

### 3.2. Direktori Frontend (`/frontend`)
*   **`/src`**: Direktori operasional antarmuka React.js.
    *   **`/pages`**: Merupakan lapisan perutean tampilan (View Layer).
        *   `Dashboard.tsx`: Modul penyedia tampilan makro (Statistik). Mengkonsumsi respons agregasi data API untuk memvisualisasikan proporsi dokumen (sengketa/perkara), indikator kemajuan (progress bar), perhitungan dinamis distribusi wilayah, serta rendering grafik interaktif.
        *   `ManajemenSurat.tsx`: Entitas antarmuka bagi operator pengelola berkas. Memiliki logika kompleks terkait ekstraksi instans File, form transmisi (multipart/form-data), hingga algoritma *Service Level Agreement* (SLA) untuk menghitung sisa waktu pengerjaan 14 hari dari waktu pembuatan dokumen.
        *   `AnalisisDokumen.tsx`: Antarmuka penyedia laporan klasifikasi keamanan dokumen dan linimasa penyelesaian tugas secara berurutan. Memvisualisasikan *state* proses berdasarkan status ("proses", "error", "selesai").
        *   `ArsipDigital.tsx`: Pangkalan dokumen retensi (yang memiliki atribut boolean `isArchived: true`). Terdiri dari algoritma filter lanjutan (berdasarkan wilayah, status kueri) dan metode abstraksi unduhan berkas BLOB via memori (Virtual Anchor Download).
    *   `App.tsx`: Sentral konfigurasi perutean klien (React Router DOM) untuk memetakan alamat URL browser ke komponen halaman yang relevan secara deklaratif.
    *   `index.css`: Direktori penyisipan kaskade direktif Tailwind CSS utama.
*   `vite.config.ts`: Modul deklarasi *bundler* kompilasi Vite yang mengatur optimasi rendering, plugin spesifik React, dan port *development server*.
*   `package.json`: Pengelola pustaka klien, kerangka tata letak spasial CSS, kerangka grafik, dan paket dependensi komponen ikon (FontAwesome).

---

## 4. ANALISIS MODUL DAN FUNGSI UTAMA (FRONTEND)

### 4.1. Modul Dashboard (`Dashboard.tsx`)
Modul ini bertanggung jawab atas presentasi metrik agregasi. 
*   **Fungsi Kalkulasi Area Geografis:** Logika mengekstrak parameter `lokasi` dari data array `filteredDocs` secara luring untuk membangun kluster persebaran dokumen (Wilayah Distribusi).
*   **Presentasi Data:** Integrasi komponen grafik menggunakan dependensi `react-chartjs-2` untuk parameter *Doughnut Chart* dan *Bar Chart*.

### 4.2. Modul Manajemen Surat (`ManajemenSurat.tsx`)
Merupakan ruang kerja komprehensif bagi operator. Terdiri atas mekanisme transmisi data dan pemantauan SLA (*Service Level Agreement*).
*   **Fungsi `handleUpload()`:**
    Memproses objek tipe `File`. Menetapkan limitasi statis `2 * 1024 * 1024` (2 Megabytes). Data dimutasi menggunakan objek `FormData` browser menuju endpoint `/api/documents`.
*   **Fungsi `handleUpdateStatus(newStatus: string)`:**
    Metode untuk melaksanakan mutasi kondisi dokumen (Proses, Error, Selesai). Memanggil permintaan berbasis HTTP PUT.
    ```typescript
    const handleUpdateStatus = async (newStatus: string) => {
      const res = await fetch(`/api/documents/${selectedDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      // Mutasi React State terhadap objek yang direvisi
    };
    ```
*   **Fungsi Kalkulasi SLA:**
    Secara dinamis mengambil parameter waktu `createdAt` dan mengkalkulasi tenggat waktu (`deadlineDate`) melalui penambahan margin 14 hari `(14 * 24 * 60 * 60 * 1000)`. Status tenggat dikomparasi secara algoritmik untuk mengeluarkan variasi peringatan visual (Hijau, Kuning, Merah).

### 4.3. Modul Arsip Digital (`ArsipDigital.tsx`)
Tempat preservasi retensi dokumen aktif yang dipindahkan dari pengawasan Manajemen Surat.
*   **Mekanisme Retensi (Pengarsipan):**
    Dokumen tidak dimutasi pada tabel lain, melainkan flag indikator `isArchived` secara boolean diubah menjadi `true`.
*   **Fungsi `handleDownload()`:**
    Teknik memicu pengunduhan pada peramban melalui instansiasi virtual *anchor DOM Element* terhadap objek URL biner milik API.
    ```typescript
    const handleDownload = (doc: DocItem) => {
      const a = document.createElement('a');
      a.href = `${API_URL}${doc.fileUrl}`;
      a.download = `${doc.judul}.pdf`; // Eksekusi force-download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    ```

---

## 5. STRUKTUR SKEMA BASIS DATA DAN ENDPOINT API (BACKEND)

### 5.1. Pemodelan Skema Prisma (`schema.prisma`)
Tabel inti dirancang bernama `Document`. Karakteristik arsitektural yang paling utama adalah parameter `fileData` bertipe `Bytes`, yang bertugas menyimpan keseluruhan rangkaian *byte* berkas unggahan PDF secara terpusat untuk menghindari inkonsistensi disk komputasi temporer Vercel.

```prisma
model Document {
  id           String   @id @default(uuid())
  noBerkas     String
  judul        String
  lokasi       String
  tipe         String   // Klasifikasi: "sengketa" atau "perkara"
  status       String   @default("proses") 
  isArchived   Boolean  @default(false)
  
  // Penanganan Biner Dokumen (BLOB Storage)
  fileData     Bytes?   
  fileMimeType String?  // MIME type identifier: 'application/pdf'
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 5.2. Pemetaan Antarmuka Pemrograman Aplikasi (API Router)
Terdapat pada `backend/src/routes/documents.ts`:
*   `POST /api/documents`: 
    Menerima muatan form (termasuk `req.file.buffer` dari Multer). Objek buffer ditransfer menuju Prisma sebagai argumen deklarasi parameter `fileData`.
*   `GET /api/documents`: 
    Memfasilitasi argumentasi *Query Parameters* tipe kueri arsip. Logika kontrol didefinisikan sebagai: `where.isArchived = archived === 'true' ? true : false;`. 
    Atribut `fileData` dieliminasi (dikecualikan dari kueri `select`) agar muatan (payload) respons JSON efisien dari segi memori (*bandwidth*).
*   `PUT /api/documents/:id`: 
    Fungsi pembaruan persial pada identitas parameter unik (UUID). Mendukung manipulasi dinamis parameter `status`, `klasifikasi`, dan sakelar retensi `isArchived`.
*   `GET /api/documents/:id/file`: 
    Endpoint streaming file, menginisialisasi header respon `Content-Type` berbasis properti basis data `fileMimeType` serta mengirimkan representasi biner secara mentah menggunakan `res.send()`.

---

## 6. SIKLUS HIDUP DAN WORKFLOW DEPLOYMENT (CI/CD)

Proses pengembangan hingga operasional rilis sistem berjalan melintasi tahapan-tahapan standar integrasi persisten (*Continuous Integration*).
1.  **Modifikasi Lokal:** Manipulasi dilakukan pada ruang kerja independen.
2.  **Transisi Basis Data:** Apabila terdapat adaptasi struktur (pada berkas `schema.prisma`), implementasi diaktifkan menuju mesin relasional melalui instruksi:
    `npx prisma db push`
    *(Peringatan: Verifikasi URL string menggunakan port 5432 khusus migrasi, terbebas dari utilitas pgbouncer Vercel).*
3.  **Protokol Git:** Eksekusi integrasi komit menuju repositori jarak jauh pada Git (*staging* via `git add`, integrasi via `git commit`, transmisi via `git push`).
4.  **Otomatisasi Kompilasi Cloud:** Vercel mendeteksi pemicu *push event*, mengakuisisi modul Node, menjalankan fase kompilasi (`vite build`), lalu memperbarui server publik dan modul fungsi API eksekusi (*Lambda Serverless*). Durasi operasi ini memiliki standar toleransi waktu komputasi 1 hingga 3 menit.

