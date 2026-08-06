import { useState, useEffect, useRef } from 'react';

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

const AnalisisDokumen = () => { 
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [modul, setModul] = useState('sengketa');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('word');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState('');
  
  const [teksPerkara, setTeksPerkara] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFilePerkara, setSelectedFilePerkara] = useState<File | null>(null);
  const fileInputRefPerkara = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedModul = localStorage.getItem('modulAktif') || 'sengketa';
    setModul(savedModul);
    fetch(`${API_URL}/documents?tipe=${savedModul}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDocuments(data);
        else setDocuments([]);
      })
      .catch(() => { setDocuments([]); });
  }, []);

  const filteredDocuments = documents.filter(doc => {
    let match = true;
    if (filterStatus && doc.status !== filterStatus) match = false;
    if (filterKlasifikasi && doc.klasifikasi !== filterKlasifikasi) match = false;
    return match;
  });

  const handleProsesAnalisis = async () => {
    if (!teksPerkara && !selectedFilePerkara) {
      alert('Masukkan Teks Perkara atau Unggah Dokumen terlebih dahulu.');
      return;
    }

    if (selectedFilePerkara && selectedFilePerkara.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }
    setIsProcessing(true);
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const formData = new FormData();
      formData.append('noBerkas', `PRK/2026/AN-${Math.floor(Math.random() * 1000)}`);
      formData.append('judul', selectedFilePerkara ? selectedFilePerkara.name : 'Analisis Teks Manual');
      formData.append('lokasi', '-');
      formData.append('tipe', 'perkara');
      formData.append('status', 'selesai');
      formData.append('klasifikasi', 'rahasia');
      formData.append('keamanan', 'internal');
      formData.append('authorId', user.id || '1');
      if (selectedFilePerkara) {
        formData.append('file', selectedFilePerkara);
      }

      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setTeksPerkara('');
        setSelectedFilePerkara(null);
        alert('Analisis Teks Berhasil diproses!');
        // Refetch documents
        const getRes = await fetch(`${API_URL}/documents?tipe=${modul}`);
        const data = await getRes.json();
        if (Array.isArray(data)) setDocuments(data);
      } else {
        alert('Gagal menyimpan hasil analisis.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus hasil analisis ini?')) return;
    try {
      const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        alert('Gagal menghapus data.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const isPerkara = modul === 'perkara';

  const renderSengketa = () => {
    const selesaiCount = documents.filter(d => d.status === 'selesai').length;
    const prosesCount = documents.filter(d => d.status === 'proses').length;
    return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">TOTAL DOKUMEN SENGKETA</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</h3>
          </div>
          <p className="text-xs font-semibold text-gray-700 mt-4 flex items-center">
            <i className="fa-solid fa-check-circle text-xs mr-1.5 text-emerald-600"></i>
            {selesaiCount} selesai, {prosesCount} proses
          </p>
        </div>

        <div className="bg-[#190c4d] text-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-200">DOKUMEN DIANALISIS</p>
              <h3 className="text-3xl font-extrabold mt-1">{documents.length}</h3>
            </div>
            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-file-invoice text-indigo-200 text-sm"></i>
            </div>
          </div>
          <h4 className="font-bold text-xs text-gray-300 uppercase tracking-wide mt-4">LIVE DATA FEED</h4>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Pemrosesan data real-time aktif</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-4">
          <h3 className="font-bold text-sm text-gray-900">Daftar Dokumen Sedang Dianalisis</h3>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button onClick={() => setShowFilterModal(true)} className="flex-1 md:flex-none p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-800 cursor-pointer text-center">
              <i className="fa-solid fa-sliders text-sm"></i>
            </button>
            <button onClick={() => setShowExportModal(true)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-800 cursor-pointer" title="Unduh CSV/PDF">
              <i className="fa-solid fa-download text-sm"></i>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800">
            <thead className="bg-gray-100/80 text-gray-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">ID ANALISIS</th>
                <th className="py-3 px-4">NO. PENGADUAN</th>
                <th className="py-3 px-4">WAKTU MULAI</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">KLASIFIKASI</th>
                <th className="py-3 px-4">PROGRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredDocuments.length === 0 ? (
                <tr><td colSpan={6} className="py-4 px-4 text-center text-gray-500">Tidak ada dokumen.</td></tr>
              ) : filteredDocuments.map((doc, idx) => {
                const isCompleted = doc.status === 'selesai';
                const isError = doc.status === 'error';
                const progress = isCompleted ? 100 : (isError ? 25 : 50);
                const timeStr = new Date(doc.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-4 font-bold text-gray-900">{doc.noBerkas}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700 max-w-[200px] truncate">{doc.judul}</td>
                    <td className="py-4 px-4 text-gray-600">{timeStr}</td>
                    <td className="py-4 px-4">
                      {isCompleted ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded text-[10px]">SELESAI</span>
                      ) : isError ? (
                        <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded text-[10px]">ERROR</span>
                      ) : (
                        <span className="bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded text-[10px] inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-900 mr-1.5"></span> PROSES
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-bold px-2.5 py-1 rounded text-[10px] uppercase ${doc.keamanan === 'internal' ? 'bg-amber-400 text-gray-900' : 'bg-emerald-200 text-emerald-900'}`}>
                        {doc.keamanan === 'internal' ? 'RAHASIA' : 'TERBUKA'}
                      </span>
                    </td>
                    <td className="py-4 px-4 w-48">
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : (isError ? 'bg-red-700' : 'bg-[#190c4d]')}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
    );
  };

  const renderPerkara = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Teks Perkara & Unggah (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-4">
            <i className="fa-solid fa-list-check text-xl text-gray-800"></i>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-900">Teks Perkara / Resume</label>
              <textarea 
                value={teksPerkara}
                onChange={(e) => setTeksPerkara(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs focus:outline-none h-28" 
                placeholder="Masukkan narasi sengketa atau salinan putusan di sini untuk dianalisis..."
              ></textarea>
              <button onClick={handleProsesAnalisis} disabled={isProcessing} className={`text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition cursor-pointer shadow-sm ${isProcessing ? 'bg-amber-400' : 'bg-[#f59e0b] hover:bg-amber-600'}`}>
                {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                <span>{isProcessing ? 'Memproses...' : 'Proses Analisis Teks'}</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-900">Unggah Dokumen Perkara (PDF/DOCX)</label>
              <div onClick={() => fileInputRefPerkara.current?.click()} className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition h-28 ${selectedFilePerkara ? 'border-[#190c4d] bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                <input type="file" ref={fileInputRefPerkara} className="hidden" accept=".pdf,.docx" onChange={(e) => setSelectedFilePerkara(e.target.files?.[0] || null)} />
                {selectedFilePerkara ? (
                  <>
                    <i className="fa-solid fa-file-pdf text-2xl text-red-500 mb-2"></i>
                    <p className="text-xs font-bold text-gray-900 truncate px-4 w-full">{selectedFilePerkara.name}</p>
                    <p className="text-[10px] text-gray-500">{(selectedFilePerkara.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-800 mb-2"></i>
                    <p className="text-xs font-bold text-gray-900">Tarik & Lepas <span className="bg-blue-600 text-white px-1">file</span> di sini</p>
                    <p className="text-[10px] text-gray-500">Maksimal 500 MB per file</p>
                  </>
                )}
              </div>
              <div className="bg-gray-100 border border-gray-200 text-center py-2 px-3 rounded-lg">
                <p className="text-[10px] text-gray-600 font-medium">Sistem mendukung OCR untuk dokumen hasil pemindaian.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Analisis (1/3 width) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-sm text-gray-900 mb-6">Ringkasan Analisis</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center text-gray-800 font-semibold"><span className="w-3 h-3 bg-red-600 rounded-full mr-3"></span> Sangat Rahasia</span>
              <span className="font-bold text-gray-900">12</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center text-gray-800 font-semibold"><span className="w-3 h-3 bg-[#f59e0b] rounded-full mr-3"></span> Rahasia</span>
              <span className="font-bold text-gray-900">48</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center text-gray-800 font-semibold"><span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span> Terbuka</span>
              <span className="font-bold text-gray-900">156</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm pt-6 space-y-4">
        <div className="px-6 flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-900">Daftar Dokumen Teranalisis</h3>
          <div className="flex items-center space-x-2">
            <button className="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1 cursor-pointer">
              <span>Terbaru</span> <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800">
            <thead className="bg-gray-100/80 text-gray-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-4 px-6">NOMOR PERKARA</th>
                <th className="py-4 px-6">PIHAK BERPERKARA</th>
                <th className="py-4 px-6">TANGGAL ANALISIS</th>
                <th className="py-4 px-6 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center">
                    <div className="border-2 border-dashed border-[#190c4d] bg-gray-50 rounded-xl p-8 max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 mb-3">
                        <i className="fa-solid fa-file-arrow-up text-[#190c4d] text-lg"></i>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Unggah Berkas Baru</h4>
                      <p className="text-xs text-gray-500">Gunakan fitur tambah berkas di Dashboard Utama</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDocuments.map((doc, idx) => {
                const dateStr = new Date(doc.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const badgeText = doc.klasifikasi === 'rahasia' ? 'Rahasia' : (doc.klasifikasi === 'sangat_rahasia' ? 'Sangat Rahasia' : 'Terbuka');
                const badgeClass = doc.klasifikasi === 'rahasia' ? 'bg-amber-100 text-amber-800' : (doc.klasifikasi === 'sangat_rahasia' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700');

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">{doc.noBerkas}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{doc.judul.substring(0, 30)}...</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{doc.author.name}</td>
                    <td className="py-4 px-6 text-gray-600">{dateStr}</td>
                    <td className="py-4 px-6 flex items-center justify-end space-x-3">
                      <span className={`font-bold px-3 py-1.5 rounded-md text-[10px] ${badgeClass}`}>
                        {badgeText}
                      </span>
                      <button onClick={() => handleDelete(doc.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer" title="Hapus">
                        <i className="fa-solid fa-trash-can text-[11px]"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bg-gray-50 py-3 px-6 text-[10px] text-gray-500 flex justify-between items-center border-t border-gray-100">
            <span>Menampilkan 1-{filteredDocuments.length || 0} dari {filteredDocuments.length || 0} hasil analisis</span>
            <div className="flex space-x-1">
              <button className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100">&lt;</button>
              <button className="w-6 h-6 rounded bg-[#190c4d] text-white flex items-center justify-center cursor-pointer">1</button>
              <button className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100">2</button>
              <button className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analisis Dokumen Surat Pengadilan ({isPerkara ? 'Perkara' : 'Sengketa'})</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPerkara 
              ? 'Sistem ekstraksi dan manajemen dokumen perkara pertanahan untuk mendukung tim hukum dalam proses persidangan.'
              : 'Sistem pendukung keputusan berbasis data untuk identifikasi sengketa pertanahan.'}
          </p>
        </div>
        
        {isPerkara && (
          <div className="flex space-x-2 w-full md:w-auto">
            <button onClick={() => setShowFilterModal(true)} className="flex-1 md:flex-none justify-center bg-white border border-gray-300 text-xs font-bold px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-50 transition shadow-sm cursor-pointer flex items-center space-x-2">
              <i className="fa-solid fa-filter"></i>
              <span>Filter</span>
            </button>
            <button onClick={() => setShowExportModal(true)} className="bg-[#190c4d] hover:bg-indigo-950 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-sm cursor-pointer">
              <i className="fa-solid fa-file-export"></i>
              <span>Ekspor Laporan</span>
            </button>
          </div>
        )}
      </div>

      {isPerkara ? renderPerkara() : renderSengketa()}

      {/* MODAL FILTER */}
      {
        showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="font-bold text-sm text-gray-900">Filter Analisis Dokumen</h3>
                <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Status Analisis</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d]">
                    <option value="">Semua Status</option>
                    <option value="selesai">Selesai</option>
                    <option value="proses">Proses</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Klasifikasi Keamanan</label>
                  <select value={filterKlasifikasi} onChange={(e) => setFilterKlasifikasi(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#190c4d]">
                    <option value="">Semua Klasifikasi</option>
                    <option value="terbuka">Terbuka</option>
                    <option value="rahasia">Rahasia</option>
                    <option value="sangat_rahasia">Sangat Rahasia</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2 shrink-0">
                <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">Batal</button>
                <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 text-xs font-bold text-white bg-[#190c4d] rounded-lg cursor-pointer hover:bg-indigo-950">Terapkan Filter</button>
              </div>
            </div>
          </div>
        )
      }

      {/* MODAL EKSPOR LAPORAN */}
      {
        showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
            <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Cetak Laporan Perkara</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Pilih format laporan yang diinginkan</p>
                </div>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><i className="fa-solid fa-xmark"></i></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  
                  {/* PDF Option */}
                  <div 
                    onClick={() => setExportFormat('pdf')}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${
                      exportFormat === 'pdf' 
                        ? 'border-red-500 bg-red-50 shadow-md ring-2 ring-red-200' 
                        : 'border-gray-200 bg-white hover:border-red-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${exportFormat === 'pdf' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'}`}>
                      <i className="fa-solid fa-file-pdf text-xl"></i>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">PDF</h4>
                    <p className="text-[9px] text-gray-500">Format standar untuk dicetak & dibagikan</p>
                  </div>

                  {/* Excel Option */}
                  <div 
                    onClick={() => setExportFormat('excel')}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${
                      exportFormat === 'excel' 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200' 
                        : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${exportFormat === 'excel' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-500'}`}>
                      <i className="fa-solid fa-file-excel text-xl"></i>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Excel</h4>
                    <p className="text-[9px] text-gray-500">Data mentah untuk analisis lebih lanjut</p>
                  </div>

                  {/* Word Option */}
                  <div 
                    onClick={() => setExportFormat('word')}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all ${
                      exportFormat === 'word' 
                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${exportFormat === 'word' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'}`}>
                      <i className="fa-solid fa-file-word text-xl"></i>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Word</h4>
                    <p className="text-[9px] text-gray-500">Dokumen yang dapat diedit kembali</p>
                  </div>
                </div>

              </div>
              
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-center space-x-3 shrink-0">
                <button onClick={() => setShowExportModal(false)} className="px-6 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition cursor-pointer shadow-sm">Batal</button>
                <button onClick={() => {
                  alert(`Laporan akan diunduh dalam format ${exportFormat.toUpperCase()}`);
                  setShowExportModal(false);
                }} className="px-6 py-2.5 text-xs font-bold text-white bg-[#190c4d] hover:bg-indigo-950 rounded-lg transition cursor-pointer shadow-md flex items-center space-x-2">
                  <i className="fa-solid fa-download"></i>
                  <span>Unduh {exportFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default AnalisisDokumen;
