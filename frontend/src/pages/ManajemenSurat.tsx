import { useState, useEffect } from 'react';

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
  fileUrl?: string;
}

const ManajemenSurat = () => {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [showViewer, setShowViewer] = useState(false);
  
  useEffect(() => {
    const savedModul = localStorage.getItem('modulAktif') || 'sengketa';
    fetch(`${API_URL}/documents?tipe=${savedModul}`)
      .then(r => r.json())
      .then((data: DocItem[]) => {
        if (Array.isArray(data)) {
          setDocuments(data);
          if (data.length > 0) {
            setSelectedDocId(data[0].id);
          }
        } else {
          setDocuments([]);
        }
      })
      .catch(() => { setDocuments([]); });
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/documents/${selectedDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Gagal update');
      const updated = await res.json();
      // Update local state with server response
      setDocuments(docs => docs.map(d => d.id === updated.id ? { ...d, ...updated } : d));
      alert(`Status dokumen berhasil diubah menjadi: ${newStatus.toUpperCase()}`);
    } catch (err) {
      alert('Gagal mengubah status dokumen.');
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  if (!selectedDoc) {
    return <div className="p-8 text-center text-gray-500">Memuat data atau tidak ada dokumen tersedia...</div>;
  }

  const isCompleted = selectedDoc.status === 'selesai';
  const progressPercent = isCompleted ? 100 : (selectedDoc.status === 'error' ? 20 : 50);
  
  // Dynamic SLA Logic (AI-like prediction based on creation date)
  const createdDate = new Date(selectedDoc.createdAt);
  const deadlineDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days SLA
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let slaConfig = {
    color: 'bg-sky-100 border-sky-300',
    titleColor: 'text-sky-800',
    descColor: 'text-sky-700',
    btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    title: 'Informasi SLA Dokumen',
    desc: `Dokumen ini memiliki batas waktu penyelesaian pada ${deadlineDate.toLocaleDateString('id-ID')}. Sisa waktu: ${diffDays} hari.`,
    btnText: 'Tinjau Dokumen',
    btnAction: () => setShowViewer(true)
  };

  if (isCompleted) {
    slaConfig = {
      color: 'bg-emerald-100 border-emerald-300',
      titleColor: 'text-emerald-800',
      descColor: 'text-emerald-700',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      title: 'Tepat Waktu (SLA Terpenuhi)',
      desc: `Dokumen telah selesai diproses sebelum batas waktu SLA (${deadlineDate.toLocaleDateString('id-ID')}).`,
      btnText: 'Arsipkan Digital',
      btnAction: async () => {
        try {
          const res = await fetch(`${API_URL}/documents/${selectedDocId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isArchived: true }),
          });
          if (!res.ok) throw new Error('Gagal');
          // Remove from local list
          setDocuments(docs => docs.filter(d => d.id !== selectedDocId));
          alert('Dokumen berhasil dipindahkan ke Arsip Digital!');
        } catch {
          alert('Gagal mengarsipkan dokumen.');
        }
      }
    };
  } else if (selectedDoc.status === 'error') {
    slaConfig = {
      color: 'bg-red-100 border-red-300',
      titleColor: 'text-red-800',
      descColor: 'text-red-700',
      btnColor: 'bg-red-700 hover:bg-red-800 text-white',
      title: 'Dokumen Bermasalah',
      desc: `Terdapat kendala pada dokumen ini. Perhitungan SLA dihentikan sementara hingga masalah tertangani.`,
      btnText: 'Selesaikan Kendala',
      btnAction: () => alert('Membuka modul penyelesaian kendala dokumen.')
    };
  } else if (diffDays <= 0) {
    slaConfig = {
      color: 'bg-red-100 border-red-300',
      titleColor: 'text-red-800',
      descColor: 'text-red-700',
      btnColor: 'bg-[#b91c1c] hover:bg-red-800 text-white',
      title: 'Peringatan SLA: Terlambat!',
      desc: `Dokumen ini telah MELEWATI batas waktu penyelesaian (${deadlineDate.toLocaleDateString('id-ID')}). Harap segera tindak lanjuti!`,
      btnText: 'Prioritaskan (Urgent)',
      btnAction: () => alert('Status Prioritas Tinggi (Urgent) Berhasil Diterapkan!')
    };
  } else if (diffDays <= 3) {
    slaConfig = {
      color: 'bg-amber-100 border-amber-300',
      titleColor: 'text-amber-800',
      descColor: 'text-amber-700',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      title: 'Peringatan SLA: Mendekati Batas Waktu',
      desc: `Dokumen ini akan melewati batas waktu dalam ${diffDays} hari (${deadlineDate.toLocaleDateString('id-ID')}). Perlu percepatan proses.`,
      btnText: 'Percepat Proses',
      btnAction: () => alert('Tugas telah dieskalasi untuk percepatan proses.')
    };
  }

  return (
    <>
      {/* -------------------- LAYOUT UNTUK CETAK (KARTU KENDALI) -------------------- */}
      <div className="hidden print:block w-full bg-white text-black p-8 font-serif">
        <div className="border-b-4 border-double border-black pb-4 mb-8 text-center flex flex-col items-center">
          <img src="/logo-bpn.png" alt="Logo BPN" className="w-16 h-16 mb-3 grayscale" />
          <h1 className="text-xl font-bold uppercase tracking-widest">KEMENTERIAN AGRARIA DAN TATA RUANG</h1>
          <h2 className="text-lg font-bold uppercase tracking-wider">BADAN PERTANAHAN NASIONAL</h2>
          <p className="text-sm mt-1">Kantor Pertanahan Kabupaten Purbalingga</p>
          <p className="text-xs">Jl. Letjen S. Parman No. 25, Purbalingga - Jawa Tengah</p>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold uppercase border-2 border-black inline-block px-8 py-2 tracking-widest">
            KARTU KENDALI {selectedDoc.tipe === 'sengketa' ? 'SENGKETA' : 'PERKARA'}
          </h3>
        </div>

        <table className="w-full text-sm mb-12 border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-3 font-bold w-1/3 bg-gray-50">Nomor Registrasi Berkas</td>
              <td className="border border-black p-3 font-bold text-lg">{selectedDoc.noBerkas}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Tanggal Masuk (Penerimaan)</td>
              <td className="border border-black p-3">{createdDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Judul / Perihal Pengaduan</td>
              <td className="border border-black p-3">{selectedDoc.judul}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Lokasi Objek Tanah</td>
              <td className="border border-black p-3">{selectedDoc.lokasi}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Klasifikasi Keamanan</td>
              <td className="border border-black p-3 uppercase">{selectedDoc.keamanan}</td>
            </tr>
            <tr>
              <td className="border border-black p-3 font-bold bg-gray-50">Tenggat Waktu Penyelesaian (SLA)</td>
              <td className="border border-black p-3 font-bold text-red-600">{deadlineDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-12">
          <h4 className="font-bold text-base border-b border-black pb-2 mb-4">Catatan Tindak Lanjut:</h4>
          <div className="h-40 border border-gray-400 p-2"></div>
        </div>

        <div className="flex justify-between mt-16 pt-8 text-sm">
          <div className="text-center w-64">
            <p className="mb-20">Pemohon / Penerima Berkas</p>
            <p className="border-b border-black font-bold">(..................................................)</p>
          </div>
          <div className="text-center w-64">
            <p className="mb-1">Purbalingga, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="mb-20">Petugas Penanggung Jawab</p>
            <p className="border-b border-black font-bold">({selectedDoc.author.name})</p>
            <p className="text-xs mt-1">NIP. .........................................</p>
          </div>
        </div>
      </div>

      {/* -------------------- LAYOUT NORMAL (WEB UI) -------------------- */}
      <div className="space-y-6 print:hidden">
      {/* Breadcrumb & Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-3">
        <div className="text-xs text-gray-500 font-medium">
          Manajemen Surat &gt; <span className="text-gray-900 font-semibold">Detail Pelacakan</span>
        </div>
        <div className="w-full sm:w-auto">
          <select 
            value={selectedDocId} 
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#190c4d] shadow-sm cursor-pointer min-w-[200px]"
          >
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.noBerkas} - {doc.judul.substring(0, 20)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert SLA Banner */}
      <div className={`${slaConfig.color} border rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center items-start gap-3 transition-colors duration-500`}>
        <div>
          <h4 className={`font-bold text-sm ${slaConfig.titleColor}`}>{slaConfig.title}</h4>
          <p className={`text-xs mt-0.5 ${slaConfig.descColor}`}>{slaConfig.desc}</p>
        </div>
        <button onClick={slaConfig.btnAction} className={`${slaConfig.btnColor} font-bold text-xs px-5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap`}>
          {slaConfig.btnText}
        </button>
      </div>

      {/* Main Surat Header Code & Buttons */}
      <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:space-x-4">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{selectedDoc.noBerkas}</h2>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit ${isCompleted ? 'bg-emerald-100 text-emerald-800' : (selectedDoc.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-sky-100 text-sky-800')}`}>
            {selectedDoc.status === 'error' ? 'BERMASALAH' : (isCompleted ? 'SELESAI' : 'PROSES PERSETUJUAN')}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => setShowViewer(true)} className="bg-white border border-gray-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-2 text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer">
            <i className="fa-regular fa-eye"></i>
            <span>Lihat Lampiran Scan</span>
          </button>
          <div className="relative group">
            <button className="bg-[#190c4d] hover:bg-indigo-950 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-sm cursor-pointer">
              <i className="fa-regular fa-pen-to-square"></i>
              <span>Update Status</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
              <button onClick={() => handleUpdateStatus('proses')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 font-medium">Proses</button>
              <button onClick={() => handleUpdateStatus('selesai')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 font-medium text-emerald-600">Selesai</button>
              <button onClick={() => handleUpdateStatus('error')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 font-medium text-red-600">Bermasalah</button>
            </div>
          </div>
        </div>
      </div>

      {/* Alur Pelacakan Workflow Stepper & Progress Bar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-gray-900">Alur Pelacakan</h3>
            <i className="fa-solid fa-rotate-left text-xs text-gray-500 cursor-pointer"></i>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-500 font-medium">Proses: <strong className="text-gray-900">{progressPercent}%</strong></span>
            <div className="w-48 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : (selectedDoc.status === 'error' ? 'bg-red-500' : 'bg-[#190c4d]')}`} style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Horizontal Stepper Lines & Nodes */}
        <div className="overflow-x-auto pb-4">
          <div className="relative py-4 px-8 min-w-[600px]">
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gray-300 -translate-y-4 -z-0"></div>

            <div className="grid grid-cols-5 text-center relative z-10">
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <i className="fa-solid fa-check"></i>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Selesai</span>
              <span className="font-bold text-xs text-gray-900">Penerimaan Berkas</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm ${progressPercent >= 40 ? 'bg-indigo-700' : 'bg-gray-300'}`}>
                {progressPercent >= 40 ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-clock"></i>}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">{progressPercent >= 40 ? 'Selesai' : 'Menunggu'}</span>
              <span className="font-bold text-xs text-gray-900">Verifikasi Dokumen</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm ${isCompleted ? 'bg-indigo-700' : (selectedDoc.status === 'error' ? 'bg-red-500' : 'bg-sky-400')}`}>
                {isCompleted ? <i className="fa-solid fa-check"></i> : (selectedDoc.status === 'error' ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-rotate"></i>)}
              </div>
              <span className="text-[11px] text-gray-700 font-semibold">{isCompleted ? 'Selesai' : (selectedDoc.status === 'error' ? 'Dihentikan' : 'Sedang Berjalan')}</span>
              <span className="font-bold text-xs text-gray-900">Review Petugas</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm ${isCompleted ? 'bg-indigo-700' : 'bg-gray-300'}`}>
                {isCompleted ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-clock"></i>}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">{isCompleted ? 'Selesai' : 'Menunggu'}</span>
              <span className="font-bold text-xs text-gray-900">Penandatanganan</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm ${isCompleted ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                {isCompleted ? <i className="fa-solid fa-check-double"></i> : <i className="fa-regular fa-clock"></i>}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">{isCompleted ? 'Tuntas' : 'Menunggu'}</span>
              <span className="font-bold text-xs text-gray-900">Hasil Akhir</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Bottom Section: Detail Tahapan Aktif & Informasi Dokumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-200/60 rounded-xl border border-gray-300 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-300 pb-3">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">DETAIL TAHAPAN AKTIF</h3>
            <span className="bg-gray-300 text-gray-800 text-[10px] font-bold px-3 py-1 rounded">Durasi: 4 Jam</span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-300 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-[#190c4d] font-bold flex items-center justify-center text-sm uppercase">
                {selectedDoc.author.name.substring(0, 2)}
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">{selectedDoc.author.name}</h4>
                <p className="text-[11px] text-gray-500">Petugas Penanggung Jawab</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {isCompleted ? 'Dokumen ini telah selesai diproses dan disetujui. Kartu Kendali sudah dapat dicetak.' : (selectedDoc.status === 'error' ? 'Terdapat masalah pada dokumen ini. Harap periksa kelengkapan syarat atau hubungi pemohon.' : `Dokumen saat ini sedang dalam proses. Harap segera periksa dan lengkapi tahap yang diperlukan.`)}
            </p>
          </div>
        </div>

        <div className="bg-gray-200/60 rounded-xl border border-gray-300 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">INFORMASI DOKUMEN</h3>
            <div>
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">ASAL INSTANSI</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">Kementerian Keuangan RI</p>
              <p className="text-[10px] text-gray-600">Jl. Lapangan Banteng Timur No. 2-4, Jakarta</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">PERIHAL</p>
              <p className="text-xs font-medium text-gray-900 mt-0.5 leading-snug">{selectedDoc.judul}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">KEAMANAN</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${selectedDoc.keamanan === 'internal' ? 'bg-[#190c4d] text-white' : 'bg-indigo-900 text-white'}`}>{selectedDoc.keamanan}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">TANGGAL MASUK</p>
                <p className="text-xs font-bold text-gray-900 mt-1">{createdDate.toLocaleDateString('id-ID')}</p>
              </div>
            </div>
            <hr className="border-gray-300" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide">TENGGAT WAKTU PENYELESAIAN (SLA)</p>
                <p className={`text-xs font-bold mt-1 ${diffDays <= 3 && !isCompleted && selectedDoc.status !== 'error' ? 'text-red-600' : 'text-gray-900'}`}>{deadlineDate.toLocaleDateString('id-ID')}</p>
              </div>
            </div>
            <hr className="border-gray-300" />
            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mb-1">OBJEK TANAH</p>
              <div className="flex justify-between"><span className="text-gray-600">Lokasi</span><span className="font-bold text-gray-900">{selectedDoc.lokasi}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tipe Modul</span><span className="font-bold text-gray-900 uppercase">{selectedDoc.tipe}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Luas Indikatif</span><span className="font-bold text-gray-900">Menunggu Survey</span></div>
            </div>
          </div>

          <button onClick={() => window.print()} className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs py-2 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm cursor-pointer mt-3">
            <i className="fa-solid fa-print"></i>
            <span>Cetak Kartu Kendali</span>
          </button>
        </div>
      </div>

      {/* Kronologi Pergerakan Berkas Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-3">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">RIWAYAT DOKUMEN</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800">
            <thead className="bg-gray-200/80 text-gray-900 uppercase font-bold text-[11px] border-y border-gray-300">
              <tr>
                <th className="py-3 px-4">PETUGAS</th>
                <th className="py-3 px-4">AKSI</th>
                <th className="py-3 px-4">WAKTU & TANGGAL</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              <tr className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-4 font-bold text-gray-900">{selectedDoc.author.name}</td>
                <td className="py-3.5 px-4">Upload & Registrasi Berkas</td>
                <td className="py-3.5 px-4 text-gray-600">{new Date(selectedDoc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-3.5 px-4 text-center"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded uppercase">SELESAI</span></td>
              </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-4 font-bold text-gray-900">{selectedDoc.author.name}</td>
                <td className="py-3.5 px-4">Status terakhir diperbarui</td>
                <td className="py-3.5 px-4 text-gray-600">{new Date(selectedDoc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded uppercase ${isCompleted ? 'bg-emerald-100 text-emerald-800' : (selectedDoc.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-sky-100 text-sky-800')}`}>
                    {selectedDoc.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* MODAL PENAMPIL DOKUMEN (DUMMY PDF) */}
    {showViewer && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-in fade-in py-10 p-4">
        <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 bg-gray-900 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center space-x-3">
              <i className="fa-solid fa-file-pdf text-red-500 text-xl"></i>
              <div>
                <h3 className="font-bold text-sm leading-tight">{selectedDoc.judul}</h3>
                <p className="text-[10px] text-gray-400">{selectedDoc.noBerkas}.pdf</p>
              </div>
            </div>
            <button onClick={() => setShowViewer(false)} className="text-gray-400 hover:text-white cursor-pointer transition">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          
          <div className="flex-1 bg-gray-100 overflow-hidden flex justify-center">
            {selectedDoc.fileUrl ? (
              <iframe 
                src={`${API_URL.replace('/api', '')}${selectedDoc.fileUrl}`} 
                className="w-full h-full border-none"
                title="Document Viewer"
              />
            ) : (
              <div className="bg-white w-full max-w-2xl min-h-full shadow-md border border-gray-300 p-12 text-center text-gray-500 flex flex-col items-center overflow-y-auto">
                <img src="/logo-bpn.png" alt="Logo" className="w-24 h-24 mb-6 grayscale opacity-20" />
                <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-4">SALINAN DIGITAL DOKUMEN</h2>
                <div className="w-16 h-1 bg-gray-200 mb-8"></div>
                
                <div className="w-full text-left space-y-6 max-w-lg mx-auto">
                  <div className="bg-gray-100 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-100 h-4 rounded w-full"></div>
                  <div className="bg-gray-100 h-4 rounded w-full"></div>
                  <div className="bg-gray-100 h-4 rounded w-5/6"></div>
                  
                  <div className="pt-8">
                    <div className="bg-gray-100 h-4 rounded w-full"></div>
                    <div className="bg-gray-100 h-4 rounded w-4/5 mt-6"></div>
                    <div className="bg-gray-100 h-4 rounded w-full mt-6"></div>
                  </div>
                </div>
                
                <p className="mt-16 text-xs text-gray-400 border border-gray-200 px-4 py-2 rounded-lg bg-gray-50">
                  (Dokumen lama ini tidak memiliki salinan digital karena diunggah sebelum fitur Cloud Storage diaktifkan.)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ManajemenSurat;
