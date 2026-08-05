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

const ArsipDigital = () => {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [modul, setModul] = useState('sengketa');
  const [selectedDate, setSelectedDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadFake = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const formData = new FormData();
      formData.append('noBerkas', `ARSIP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`);
      formData.append('judul', file.name);
      formData.append('lokasi', '-');
      formData.append('tipe', modul);
      formData.append('status', 'selesai');
      formData.append('klasifikasi', 'terbuka');
      formData.append('keamanan', 'internal');
      formData.append('authorId', user.id || '1');
      formData.append('file', file);

      try {
        const res = await fetch(`${API_URL}/documents`, { method: 'POST', body: formData });
        if (res.ok) {
          alert("Berkas berhasil diunggah dan diarsipkan!");
          // Refetch
          const getRes = await fetch(`${API_URL}/documents?tipe=${modul}`);
          const data = await getRes.json();
          if (Array.isArray(data)) setDocuments(data);
        } else {
          alert("Gagal mengunggah berkas.");
        }
      } catch (err) {
        alert("Terjadi kesalahan jaringan.");
      }
    }
  };
  
  // Advanced Filter states
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterType, setFilterType] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterWilayah, setFilterWilayah] = useState('Semua Kecamatan');

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

  const isPerkara = modul === 'perkara';
  
  // Filtering logic
  const filteredDocuments = documents.filter(doc => {
    // Time filter
    if (selectedDate) {
      const docDateStr = new Date(doc.createdAt).toISOString().split('T')[0];
      if (docDateStr !== selectedDate) return false;
    }

    // Status Filter
    if (filterStatus !== 'Semua Status') {
      const s = filterStatus.toLowerCase();
      if (doc.status !== s) return false;
    }

    // Wilayah Filter (simple matching)
    if (filterWilayah !== 'Semua Kecamatan') {
      const w = filterWilayah.replace('Kec. ', '').toLowerCase();
      if (!doc.lokasi.toLowerCase().includes(w)) return false;
    }

    return true;
  });

  const butuhReviewCount = documents.filter(d => d.status === 'proses').length;
  const recentCount = documents.filter(d => (new Date().getTime() - new Date(d.createdAt).getTime()) < 86400000).length; // 24h
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-start items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Arsip Digital: Surat Pengaduan ({isPerkara ? 'Perkara' : 'Sengketa'})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manajemen berkas pertanahan dan analisis dokumen legal surat pengaduan {isPerkara ? 'perkara' : 'sengketa'} Kantor Pertanahan.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="bg-[#190c4d] text-white text-[10px] font-bold px-3 py-1 rounded-md flex items-center space-x-1.5"><i className="fa-solid fa-lock text-[9px]"></i><span>INTERNAL</span></span>
          <span className="text-[10px] text-gray-400 font-medium truncate">Update terakhir: 12 Juli 2025, 09:41</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-lg text-lg"><i className="fa-solid fa-folder"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Total Dokumen</p><p className="text-xl font-bold text-gray-900">{documents.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-lg"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Butuh Review</p><p className="text-xl font-bold text-gray-900">{butuhReviewCount}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-lg text-lg"><i className="fa-solid fa-rotate"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Unggahan Baru (24j)</p><p className="text-xl font-bold text-gray-900">{recentCount}</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <div className="relative">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-gray-300 text-xs font-semibold px-4 py-2 rounded-xl text-gray-800 hover:bg-gray-50 transition shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#190c4d]"
          />
        </div>

        <button onClick={() => setShowAdvancedFilter(true)} className="bg-white border border-gray-300 text-xs font-semibold px-4 py-2 rounded-xl text-gray-800 hover:bg-gray-50 transition shadow-sm cursor-pointer flex items-center space-x-2">
          <i className="fa-solid fa-sliders"></i>
          <span>Filter Lanjutan</span>
        </button>
      </div>

      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-3">Dokumen Terbaru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocuments.slice(0, 3).map((doc, idx) => {
            const dateStr = new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition p-3 space-y-3">
                <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <i className={`fa-regular ${idx % 2 === 0 ? 'fa-file-pdf text-red-400' : 'fa-file-word text-blue-400'} text-4xl`}></i>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-xs text-gray-900 truncate" title={doc.noBerkas}>{doc.noBerkas}</p>
                  <p className="text-[10px] text-gray-400">{dateStr} • 2.4 MB</p>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-900 text-white font-bold text-[9px] flex items-center justify-center">
                    {doc.author.name.substring(0, 2).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${doc.status === 'selesai' ? 'text-emerald-600' : (doc.status === 'error' ? 'text-red-600' : 'text-sky-600')}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            );
          })}
          
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#190c4d] bg-indigo-50/50 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-100/50 transition flex flex-col items-center justify-center space-y-2 relative">
            <input type="file" ref={fileInputRef} onChange={handleUploadFake} className="hidden" accept=".pdf,.docx,.jpg" />
            <div className="w-10 h-10 bg-white shadow-sm text-indigo-900 rounded-xl flex items-center justify-center text-lg"><i className="fa-solid fa-file-arrow-up"></i></div>
            <div><h4 className="font-bold text-xs text-gray-900">Unggah Berkas Baru</h4><p className="text-[10px] text-gray-500 mt-1 leading-tight">Mendukung format PDF, DOCX, JPG</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">RIWAYAT ANALISIS TERBARU</h3>
          <button className="text-xs font-bold text-gray-900 hover:underline flex items-center space-x-1 cursor-pointer"><span>Lihat Semua</span><i className="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800">
            <thead className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
              <tr><th>Nama Dokumen</th><th>Lokasi</th><th>Tipe Sengketa</th><th>Petugas</th><th>Keamanan</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredDocuments.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">Belum ada arsip dokumen pada rentang waktu ini.</td></tr>
              ) : filteredDocuments.map((doc, idx) => {
                const isPdf = idx % 2 === 0;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center space-x-2">
                      <i className={`fa-regular ${isPdf ? 'fa-file-pdf text-red-600' : 'fa-file-word text-blue-600'} text-sm`}></i>
                      <span>{doc.noBerkas}.{isPdf ? 'pdf' : 'docx'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 truncate max-w-[150px]">{doc.lokasi}</td>
                    <td className="py-3.5 px-4"><span className="bg-gray-200 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded truncate max-w-[100px] inline-block">{doc.judul}</span></td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{doc.author.name}</td>
                    <td className="py-3.5 px-4">
                      {doc.keamanan === 'internal' ? (
                        <span className="bg-[#190c4d] text-white text-[9px] font-bold px-2.5 py-0.5 rounded flex items-center space-x-1 w-fit"><i className="fa-solid fa-lock text-[8px]"></i><span>INTERNAL</span></span>
                      ) : (
                        <span className="bg-indigo-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded flex items-center space-x-1 w-fit"><i className="fa-solid fa-globe text-[8px]"></i><span>PUBLIK</span></span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.status === 'selesai' ? (
                        <span className="text-emerald-600 font-bold text-[10px] flex items-center space-x-1"><i className="fa-regular fa-circle-check"></i><span>VERIFIED</span></span>
                      ) : doc.status === 'error' ? (
                        <span className="text-red-600 font-bold text-[10px] flex items-center space-x-1"><i className="fa-solid fa-triangle-exclamation"></i><span>ERROR</span></span>
                      ) : (
                        <span className="text-sky-600 font-bold text-[10px] flex items-center space-x-1"><i className="fa-regular fa-clock"></i><span>PROSES</span></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FILTER LANJUTAN MODAL */}
      {showAdvancedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Filter Lanjutan Arsip {isPerkara ? 'Perkara' : 'Sengketa'}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Sesuaikan kriteria pencarian dokumen pengaduan {isPerkara ? 'perkara' : 'sengketa'}</p>
              </div>
              <button onClick={() => setShowAdvancedFilter(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Tipe {isPerkara ? 'Perkara' : 'Sengketa'}</label>
                <div className="flex flex-wrap gap-2">
                  {['Semua', 'Batas Tanah', 'Warisan', 'Sertifikat Ganda', 'Lainnya'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${filterType === type ? 'bg-[#190c4d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Status Penanganan</label>
                <div className="relative">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-100/50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#190c4d] cursor-pointer"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Proses">Sedang Proses</option>
                    <option value="Selesai">Selesai (Tuntas)</option>
                    <option value="Error">Error / Kendala</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-gray-400 text-[10px] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Wilayah Kecamatan</label>
                <div className="relative">
                  <select 
                    value={filterWilayah}
                    onChange={(e) => setFilterWilayah(e.target.value)}
                    className="w-full bg-gray-100/50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#190c4d] cursor-pointer"
                  >
                    <option value="Semua Kecamatan">Semua Kecamatan</option>
                    <option value="Bobotsari">Bobotsari</option>
                    <option value="Bojongsari">Bojongsari</option>
                    <option value="Bukateja">Bukateja</option>
                    <option value="Kaligondang">Kaligondang</option>
                    <option value="Purbalingga">Purbalingga</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-gray-400 text-[10px] pointer-events-none"></i>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowAdvancedFilter(false)} className="px-6 py-2.5 text-xs font-bold text-white bg-[#190c4d] hover:bg-indigo-950 rounded-lg transition cursor-pointer shadow-md">
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArsipDigital;
