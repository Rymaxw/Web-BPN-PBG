import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface DocItem {
  id: string;
  noBerkas: string;
  judul: string;
  lokasi: string;
  tipe: string;
  status: string;
  klasifikasi: string;
  keamanan: string;
  author: { name: string };
  createdAt: string;
}

interface Stats {
  total: number;
  proses: number;
  selesai: number;
  error: number;
}

interface GlobalStats {
  sengketaCount: number;
  sengketaSelesai: number;
  perkaraCount: number;
  perkaraProses: number;
  trend: { sengketa: number[]; perkara: number[] };
}

const Dashboard = () => {
  const [modul, setModul] = useState('sengketa');
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, proses: 0, selesai: 0, error: 0 });
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ 
    sengketaCount: 0, sengketaSelesai: 0, perkaraCount: 0, perkaraProses: 0, 
    trend: { sengketa: [0,0,0,0,0], perkara: [0,0,0,0,0] }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [selectedDate, setSelectedDate] = useState('');

  // Jadwal Sidang state
  const [jadwalSidang, setJadwalSidang] = useState([
    { id: 1, date: '14 Jul', location: 'PN Purbalingga - Ruang 1', detail: 'pukul 09.00 WIB - Perkara #0012' },
    { id: 2, date: '15 Jul', location: 'PTUN Semarang', detail: 'pukul 10.30 WIB - Perkara #0013' }
  ]);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState({ id: 0, date: '', location: '', detail: '' });

  const [uploadData, setUploadData] = useState({ noBerkas: '', judul: '', lokasi: '', keamanan: 'internal', klasifikasi: 'Sengketa Batas Lahan' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const savedModul = localStorage.getItem('modulAktif') || 'sengketa';
    setModul(savedModul);
  }, []);

  const fetchData = () => {
    fetch(`${API_URL}/documents?tipe=${modul}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDocuments(data);
        else setDocuments([]);
      })
      .catch(() => { setDocuments([]); });

    fetch(`${API_URL}/documents/stats?tipe=${modul}`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.total === 'number') setStats(data);
      })
      .catch(() => { setStats({ total: 0, proses: 0, selesai: 0, error: 0 }); });

    fetch(`${API_URL}/documents/global-stats`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.sengketaCount === 'number') setGlobalStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, [modul]);

  const isPerkara = modul === 'perkara';

  const filteredDocs = documents.filter(d =>
    d.noBerkas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    setShowExportModal(true);
  };

  const executeExport = () => {
    window.open(`${API_URL}/documents/export?tipe=${modul}`, '_blank');
    setShowExportModal(false);
  };

  const handleUpload = async () => {
    if (!uploadData.noBerkas || !uploadData.judul || !uploadData.lokasi) {
      alert('Harap isi Nomor Berkas, Nama Pemohon, dan NIK/NIB.');
      return;
    }

    setIsUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const formData = new FormData();
      formData.append('noBerkas', uploadData.noBerkas);
      formData.append('judul', uploadData.judul);
      formData.append('lokasi', uploadData.lokasi);
      formData.append('keamanan', uploadData.keamanan);
      formData.append('klasifikasi', uploadData.klasifikasi);
      formData.append('tipe', modul);
      formData.append('status', 'proses');
      formData.append('authorId', user.id || '1');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setShowUploadModal(false);
        setUploadData({ noBerkas: '', judul: '', lokasi: '', keamanan: 'internal', klasifikasi: 'Sengketa Batas Lahan' });
        setSelectedFile(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsUploading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'proses': return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold rounded text-[10px] inline-flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-900 mr-1.5"></span>PROSES</span>;
      case 'selesai': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">SELESAI</span>;
      case 'error': return <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded text-[10px]">ERROR</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded text-[10px]">{status.toUpperCase()}</span>;
    }
  };

  const keamananBadge = (keamanan: string) => {
    if (keamanan === 'internal') return <span className="bg-[#190c4d] text-white text-[9px] font-bold px-2.5 py-0.5 rounded flex items-center space-x-1 w-fit"><i className="fa-solid fa-lock text-[8px]"></i><span>INTERNAL</span></span>;
    return <span className="bg-indigo-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded flex items-center space-x-1 w-fit"><i className="fa-solid fa-globe text-[8px]"></i><span>PUBLIK</span></span>;
  };

  const renderSengketa = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center items-start mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Dashboard Sengketa
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Selamat pagi, {JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:space-x-3 relative">
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#190c4d]"
            />
          </div>

          <button onClick={handleExport} type="button" className="bg-[#190c4d] text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-indigo-950 transition shadow-sm cursor-pointer">
            <i className="fa-solid fa-download"></i>
            <span>Ekspor Laporan</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-[#190c4d] rounded-lg text-xl">
            <i className={isPerkara ? "fa-solid fa-gavel" : "fa-solid fa-folder-open"}></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total {isPerkara ? 'Perkara' : 'Sengketa'}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg text-xl"><i className="fa-solid fa-clock"></i></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Sedang Proses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.proses}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl"><i className="fa-solid fa-circle-check"></i></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Selesai</p>
            <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xl"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Error</p>
            <p className="text-2xl font-bold text-gray-900">{stats.error}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">SEMUA ANTREAN {isPerkara ? 'PERKARA' : 'BERKAS'}</h3>
            <p className="text-[11px] text-gray-500">Kelola dan Analisis Dokumen {isPerkara ? 'Perkara' : 'Sengketa'} yang masuk.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-center items-start mb-4 gap-3">
          <span className="text-xs text-gray-500">Daftar Antrean <span className="font-semibold text-gray-700">(Total {stats.total} berkas terdaftar)</span></span>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No.Berkas/Judul..."
                className="bg-gray-100 text-[11px] border border-gray-200 rounded-lg px-3 py-1.5 pl-7 w-full md:w-48 focus:outline-none"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-[10px] text-gray-400"></i>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="bg-[#190c4d] text-white text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-950 transition cursor-pointer flex items-center space-x-1 shrink-0">
              <span>+ Berkas Baru</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="text-gray-900 bg-gray-50 border-y border-gray-200 uppercase text-[11px]">
              <tr>
                <th className="px-4 py-2.5">NO BERKAS</th>
                <th className="px-4 py-2.5">JUDUL</th>
                <th className="px-4 py-2.5">LOKASI</th>
                <th className="px-4 py-2.5">PETUGAS</th>
                <th className="px-4 py-2.5">KEAMANAN</th>
                <th className="px-4 py-2.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredDocs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900">{doc.noBerkas}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700 max-w-[200px] truncate">{doc.judul}</td>
                    <td className="px-4 py-3.5 text-gray-600">{doc.lokasi}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{doc.author.name}</td>
                    <td className="px-4 py-3.5">{keamananBadge(doc.keamanan)}</td>
                    <td className="px-4 py-3.5">{statusBadge(doc.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide mb-4">DISTRIBUSI BEBAN KERJA</h3>
          <div className="flex-1 flex justify-center items-center min-h-[150px] mb-4">
            <div className="w-40 h-40">
              <Doughnut
                data={{
                  labels: ['Sengketa', 'Perkara'],
                  datasets: [{
                    data: [globalStats.sengketaCount, globalStats.perkaraCount],
                    backgroundColor: ['#190c4d', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4
                  }]
                }}
                options={{
                  cutout: '75%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-gray-700 font-medium">
                <span className="w-3 h-3 bg-[#190c4d] inline-block mr-2 rounded-sm"></span> Sengketa
              </span>
              <span className="font-bold text-gray-900">70%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-gray-700 font-medium">
                <span className="w-3 h-3 bg-[#f59e0b] inline-block mr-2 rounded-sm"></span> Perkara
              </span>
              <span className="font-bold text-gray-900">30%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">STATUS ANTREAN</h3>
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700">Penyelesaian Sengketa</span>
              <span className="font-bold text-gray-900">{globalStats.sengketaCount > 0 ? Math.round((globalStats.sengketaSelesai / globalStats.sengketaCount) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#190c4d] h-2 rounded-full transition-all" style={{ width: `${globalStats.sengketaCount > 0 ? (globalStats.sengketaSelesai / globalStats.sengketaCount) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700">Progres Perkara</span>
              <span className="font-bold text-gray-900">{globalStats.perkaraCount > 0 ? Math.round((globalStats.perkaraProses / globalStats.perkaraCount) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#f59e0b] h-2 rounded-full transition-all" style={{ width: `${globalStats.perkaraCount > 0 ? (globalStats.perkaraProses / globalStats.perkaraCount) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">TREN PENANGANAN</h3>
          <p className="text-xs text-gray-500">Perbandingan volume masuk harian antara Sengketa dan Perkara.</p>
          <div className="mt-4 h-48 w-full">
            <Bar
              data={{
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'],
                datasets: [
                  { label: 'Sengketa', data: globalStats.trend.sengketa, backgroundColor: '#190c4d', borderRadius: 4 },
                  { label: 'Perkara', data: globalStats.trend.perkara, backgroundColor: '#f59e0b', borderRadius: 4 }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { display: false, beginAtZero: true },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs font-bold pt-2">
            <span className="flex items-center"><span className="w-3 h-1 bg-[#190c4d] inline-block mr-1.5"></span> SENGKETA</span>
            <span className="flex items-center"><span className="w-3 h-1 bg-[#f59e0b] inline-block mr-1.5"></span> PERKARA</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderPerkara = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center items-start mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Dashboard Perkara
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Ringkasan operasional dan penanganan perkara pengadilan hari ini.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative">
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#190c4d]"
            />
          </div>

          <button onClick={() => setShowUploadModal(true)} type="button" className="bg-[#190c4d] text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-indigo-950 transition shadow-sm cursor-pointer">
            <i className="fa-solid fa-plus"></i>
            <span>Registrasi Perkara Baru</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Perkara */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center text-lg"><i className="fa-solid fa-gavel"></i></div>
            <span className="text-emerald-500 text-[10px] font-bold flex items-center"><i className="fa-solid fa-arrow-trend-up mr-1"></i> 12%</span>
          </div>
          <div>
            <p className="text-xs text-gray-900 font-bold mb-1">Perkara Berjalan</p>
            <p className="text-2xl font-bold text-gray-900">142</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-lg"><i className="fa-solid fa-bullhorn"></i></div>
            <span className="text-gray-500 text-[10px] font-bold">Hari ini</span>
          </div>
          <div>
            <p className="text-xs text-gray-900 font-bold mb-1">Panggilan Sidang</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center text-lg"><i className="fa-solid fa-gauge-high"></i></div>
            <span className="text-red-500 text-[10px] font-bold flex items-center"><i className="fa-solid fa-arrow-trend-down mr-1"></i> 4%</span>
          </div>
          <div>
            <p className="text-xs text-gray-900 font-bold mb-1">SLA RATA-RATA</p>
            <p className="text-2xl font-bold text-gray-900">14 Hari</p>
          </div>
        </div>

        <div className="bg-[#190c4d] p-5 rounded-xl border border-[#190c4d] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-10 h-10 bg-white/20 text-white rounded-lg flex items-center justify-center text-lg"><i className="fa-regular fa-circle-check"></i></div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-1">SELESAI BULAN INI</p>
            <p className="text-2xl font-bold text-white">27 Case</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-gray-900">Antrean Berkas Perkara</h3>
            <button className="text-xs text-gray-500 font-semibold hover:text-gray-900 transition flex items-center cursor-pointer">
              <span>Lihat Semua</span> <i className="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-800">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4">NO. BERKAS</th>
                  <th className="py-3 px-4">PIHAK BERPERKARA</th>
                  <th className="py-3 px-4">TAHAPAN</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">PRK/2025/0012</p>
                    <p className="text-[10px] text-gray-500">12 Jul 2025</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">H. Sudirman<br />vs. PT Maju Jaya</td>
                  <td className="py-4 px-4 text-gray-600">Mediasi</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px]">Proses</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">PRK/2025/0045</p>
                    <p className="text-[10px] text-gray-500">15 Jul 2025</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">Siti Aminah vs.<br />Kantor Pertanahan</td>
                  <td className="py-4 px-4 text-gray-600">Jawaban Tergugat</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg text-[10px]">Menunggu Review</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">PRK/2025/1102</p>
                    <p className="text-[10px] text-gray-500">19 Jul 2025</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">Yayasan Bakti vs.<br />Perorangan</td>
                  <td className="py-4 px-4 text-gray-600">Sidang Putusan</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-[10px]">Selesai</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-sm text-gray-900 mb-6 uppercase tracking-wide">DISTRIBUSI WILAYAH</h3>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 border-4 border-[#8c7349] rounded-xl rotate-45 flex items-center justify-center mb-4">
                <div className="-rotate-45 text-center">
                  <p className="text-lg font-bold text-gray-900">64%</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Pusat Kota</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center text-gray-700"><span className="w-2 h-2 rounded-full bg-[#8c7349] mr-2"></span>Purbalingga Kota</span>
                <span className="text-gray-900">60</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center text-gray-700"><span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>Bobotsari</span>
                <span className="text-gray-900">32</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center text-gray-700"><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>Bukateja</span>
                <span className="text-gray-900">24</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">PANGGILAN SIDANG MENDATANG</h3>
              <button 
                onClick={() => setShowJadwalModal(true)}
                className="text-gray-400 hover:text-[#190c4d] transition cursor-pointer"
                title="Edit Jadwal Sidang"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
            <div className="space-y-3">
              {jadwalSidang.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">Belum ada jadwal sidang.</div>
              ) : jadwalSidang.map((jadwal) => (
                <div key={jadwal.id} className="flex bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="pr-4 border-r border-gray-200 text-center flex flex-col justify-center min-w-[60px]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{jadwal.date.split(' ')[1] || ''}</span>
                    <span className="text-lg font-bold text-gray-900">{jadwal.date.split(' ')[0] || ''}</span>
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-bold text-gray-900">{jadwal.location}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{jadwal.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-500 font-medium">
        Dashboard &gt; <span className="text-gray-900 font-semibold">{isPerkara ? 'Perkara' : 'Sengketa'}</span>
      </div>
      {isPerkara ? renderPerkara() : renderSengketa()}

      {/* MODAL EKSPOR LAPORAN */}
      {
        showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in p-4">
            <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Cetak Laporan {isPerkara ? 'Perkara' : 'Sengketa'}</h3>
                  <p className="text-[11px] text-gray-500 mt-1 flex items-center"><i className="fa-regular fa-file-lines mr-1.5"></i> Nomor Berkas: P31/BPN/2025-082</p>
                </div>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><i className="fa-solid fa-xmark text-lg"></i></button>
              </div>
              <div className="p-6 space-y-4 bg-white">
                <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-3">PILIH FORMAT LAPORAN</label>
                
                <div 
                  onClick={() => setExportFormat('pdf')}
                  className={`border ${exportFormat === 'pdf' ? 'border-[#190c4d] ring-1 ring-[#190c4d] bg-gray-50' : 'border-gray-200 hover:border-gray-300'} rounded-lg p-4 cursor-pointer flex items-center space-x-4 transition`}
                >
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 text-xl"><i className="fa-solid fa-file-pdf"></i></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">PDF (Laporan Lengkap)</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Termasuk data kronologi lampiran scan, dan riwayat petugas.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setExportFormat('word')}
                  className={`border ${exportFormat === 'word' ? 'border-[#190c4d] ring-2 ring-[#190c4d] bg-gray-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'} rounded-lg p-4 cursor-pointer flex items-center space-x-4 transition`}
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 text-xl"><i className="fa-solid fa-file-word"></i></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Word (Ringkasan)</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Ringkasan eksekutif untuk keperluan draf surat keputusan.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setExportFormat('excel')}
                  className={`border ${exportFormat === 'excel' ? 'border-[#190c4d] ring-1 ring-[#190c4d] bg-gray-50' : 'border-gray-200 hover:border-gray-300'} rounded-lg p-4 cursor-pointer flex items-center space-x-4 transition`}
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 text-xl"><i className="fa-solid fa-file-excel"></i></div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Excel (Log Aktivitas)</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Tabel terstruktur berisi data mentah pergerakan berkas.</p>
                  </div>
                </div>

                <div className="bg-[#c2e7ff] p-4 rounded-lg flex items-start space-x-3 mt-4">
                  <i className="fa-solid fa-shield text-sky-900 mt-0.5"></i>
                  <p className="text-[10px] text-gray-800 leading-relaxed font-medium">Dokumen ini bersifat RAHASIA. Pengunduhan laporan akan dicatat dalam log sistem keamanan Kantah Purbalingga.</p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end space-x-2">
                <button onClick={() => setShowExportModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-lg transition cursor-pointer">Batal</button>
                <button onClick={executeExport} className="px-6 py-2.5 text-xs font-bold text-white bg-[#190c4d] hover:bg-indigo-950 rounded-lg transition flex items-center space-x-2 cursor-pointer shadow-md">
                  <i className="fa-solid fa-download"></i><span>Unduh Laporan</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* MODAL UPLOAD / TAMBAH BERKAS */}
      {
        showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
            <div className="bg-white w-full max-w-[550px] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Tambah Berkas Baru</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Lengkapi formulir di bawah ini untuk mendaftarkan antrean berkas analisis teks baru.</p>
                </div>
                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg"><i className="fa-solid fa-xmark"></i></button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto bg-white flex-1">
                {/* IDENTITAS BERKAS */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#190c4d] uppercase tracking-wider">IDENTITAS BERKAS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 mb-1">Nomor Berkas</label>
                      <input 
                        type="text" 
                        placeholder="Contoh : B-2025-IX-0000" 
                        value={uploadData.noBerkas} 
                        onChange={(e) => setUploadData({...uploadData, noBerkas: e.target.value})} 
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 mb-1">Modul</label>
                      <div className="relative">
                        <input type="text" value={isPerkara ? "Perkara" : "Sengketa"} disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-lg px-3 py-2 text-xs cursor-not-allowed" />
                        <i className="fa-solid fa-lock absolute right-3 top-2.5 text-gray-400 text-[10px]"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFORMASI PEMOHON */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#190c4d] uppercase tracking-wider">INFORMASI PEMOHON</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Nama Pemohon/Institusi</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan Nama Lengkap" 
                      value={uploadData.judul} 
                      onChange={(e) => setUploadData({...uploadData, judul: e.target.value})} 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d]" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 mb-1">NIK/NIB</label>
                      <input 
                        type="text" 
                        placeholder="16 digit angka" 
                        value={uploadData.lokasi} 
                        onChange={(e) => setUploadData({...uploadData, lokasi: e.target.value})} 
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 mb-1">Subjek Sengketa</label>
                      <div className="relative">
                        <select 
                          value={uploadData.klasifikasi || 'Sengketa Batas Lahan'} 
                          onChange={(e) => setUploadData({...uploadData, klasifikasi: e.target.value})} 
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d] appearance-none cursor-pointer"
                        >
                          <option value="Sengketa Batas Lahan">Sengketa Batas Lahan</option>
                          <option value="Sengketa Waris Tanah">Sengketa Waris Tanah</option>
                          <option value="Sertifikat Ganda">Sertifikat Ganda</option>
                          <option value="Sengketa Kepemilikan Hak">Sengketa Kepemilikan Hak</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-3 top-2.5 text-gray-400 text-[10px] pointer-events-none"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UNGGAH DOKUMEN */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#190c4d] uppercase tracking-wider">UNGGAH DOKUMEN</h4>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.jpg" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <i className="fa-solid fa-file-pdf text-3xl text-red-500 mb-2"></i>
                        <p className="text-xs font-bold text-gray-900 mt-2">{selectedFile.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-[#190c4d] mb-3"></i>
                        <p className="text-xs font-bold text-gray-900">Klik untuk unggah atau seret berkas ke sini</p>
                        <p className="text-[10px] text-gray-500 mt-1">Hanya file PDF, DOCX, atau JPG (Maks 10MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* INFO BANNER */}
                <div className="bg-[#c2e7ff] p-4 rounded-lg flex items-start space-x-3">
                  <div className="mt-0.5"><i className="fa-solid fa-shield text-[#190c4d]"></i></div>
                  <div>
                    <p className="text-[10px] font-bold text-[#190c4d] uppercase">CLASSIFIED INTERNAL</p>
                    <p className="text-[9px] text-[#190c4d] mt-0.5 font-medium">Enkripsi AES-256 diterapkan pada seluruh berkas yang diunggah.</p>
                  </div>
                </div>
                
              </div>
              
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-center space-x-3 shrink-0">
                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="px-6 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition cursor-pointer shadow-sm">Batal</button>
                <button onClick={handleUpload} disabled={isUploading} className={`px-6 py-2.5 text-xs font-bold text-white rounded-lg transition shadow-md cursor-pointer ${isUploading ? 'bg-gray-400' : 'bg-[#190c4d] hover:bg-indigo-950'}`}>
                  {isUploading ? 'Menyimpan...' : 'Simpan Berkas'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* MODAL EDIT JADWAL SIDANG */}
      {
        showJadwalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
            <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Kelola Jadwal Sidang</h3>
                </div>
                <button onClick={() => setShowJadwalModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><i className="fa-solid fa-xmark"></i></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                  <h4 className="text-xs font-bold text-sky-900 mb-3">{editingJadwal.id ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Tanggal (Contoh: 16 Jul)</label>
                      <input type="text" value={editingJadwal.date} onChange={(e) => setEditingJadwal({...editingJadwal, date: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#190c4d]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Lokasi (Pengadilan)</label>
                      <input type="text" value={editingJadwal.location} onChange={(e) => setEditingJadwal({...editingJadwal, location: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#190c4d]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">Detail (Waktu & No Perkara)</label>
                    <input type="text" value={editingJadwal.detail} onChange={(e) => setEditingJadwal({...editingJadwal, detail: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#190c4d]" placeholder="pukul 09.00 WIB - Perkara #0012" />
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button onClick={() => setEditingJadwal({ id: 0, date: '', location: '', detail: '' })} className="px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-300 rounded cursor-pointer hover:bg-gray-100">Batal</button>
                    <button onClick={() => {
                      if (!editingJadwal.date || !editingJadwal.location) return;
                      if (editingJadwal.id) {
                        setJadwalSidang(jadwalSidang.map(j => j.id === editingJadwal.id ? editingJadwal : j));
                      } else {
                        setJadwalSidang([...jadwalSidang, { ...editingJadwal, id: Date.now() }]);
                      }
                      setEditingJadwal({ id: 0, date: '', location: '', detail: '' });
                    }} className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#190c4d] rounded cursor-pointer hover:bg-indigo-950">Simpan Jadwal</button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold text-gray-800 mb-2">Daftar Jadwal Sidang</h4>
                  {jadwalSidang.map((jadwal) => (
                    <div key={jadwal.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded p-3">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{jadwal.date} - {jadwal.location}</p>
                        <p className="text-[10px] text-gray-500">{jadwal.detail}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => setEditingJadwal(jadwal)} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"><i className="fa-solid fa-edit text-xs"></i></button>
                        <button onClick={() => setJadwalSidang(jadwalSidang.filter(j => j.id !== jadwal.id))} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><i className="fa-solid fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                  {jadwalSidang.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Tidak ada jadwal terdaftar.</p>}
                </div>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default Dashboard; 