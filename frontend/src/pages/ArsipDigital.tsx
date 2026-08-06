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
  fileUrl?: string;
  fileMimeType?: string;
  author: { name: string };
  createdAt: string;
}

const ArsipDigital = () => {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [modul, setModul] = useState('sengketa');
  const [selectedDate, setSelectedDate] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<DocItem | null>(null);
  
  // Advanced Filter states
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterWilayah, setFilterWilayah] = useState('Semua Kecamatan');

  const fetchArchived = (tipe: string) => {
    fetch(`${API_URL}/documents?tipe=${tipe}&archived=true`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDocuments(data);
        else setDocuments([]);
      })
      .catch(() => { setDocuments([]); });
  };

  useEffect(() => {
    const savedModul = localStorage.getItem('modulAktif') || 'sengketa';
    setModul(savedModul);
    fetchArchived(savedModul);
  }, []);

  const isPerkara = modul === 'perkara';
  
  // Filtering logic
  const filteredDocuments = documents.filter(doc => {
    if (selectedDate) {
      const docDateStr = new Date(doc.createdAt).toISOString().split('T')[0];
      if (docDateStr !== selectedDate) return false;
    }
    if (filterStatus !== 'Semua Status') {
      const s = filterStatus.toLowerCase();
      if (doc.status !== s) return false;
    }
    if (filterWilayah !== 'Semua Kecamatan') {
      const w = filterWilayah.replace('Kec. ', '').toLowerCase();
      if (!doc.lokasi.toLowerCase().includes(w)) return false;
    }
    return true;
  });

  const handleDownload = (doc: DocItem) => {
    if (!doc.fileUrl) {
      alert('Dokumen ini tidak memiliki file.');
      return;
    }
    const url = `${API_URL.replace('/api', '')}${doc.fileUrl}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.judul || doc.noBerkas}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreview = (doc: DocItem) => {
    setViewerDoc(doc);
    setShowViewer(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-start items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Arsip Digital: Surat Pengaduan ({isPerkara ? 'Perkara' : 'Sengketa'})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Berkas yang sudah selesai diproses dan dipindahkan ke arsip digital.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-lg text-lg"><i className="fa-solid fa-folder"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Total Arsip</p><p className="text-xl font-bold text-gray-900">{documents.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg text-lg"><i className="fa-solid fa-circle-check"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Terverifikasi</p><p className="text-xl font-bold text-gray-900">{documents.filter(d => d.status === 'selesai').length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-lg text-lg"><i className="fa-solid fa-file-pdf"></i></div>
          <div><p className="text-[11px] text-gray-500 font-semibold">Memiliki File</p><p className="text-xl font-bold text-gray-900">{documents.filter(d => d.fileUrl).length}</p></div>
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

      {/* Document Cards */}
      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-3">Dokumen Terarsip</h3>
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <i className="fa-solid fa-box-archive text-4xl text-gray-300 mb-4"></i>
            <p className="text-sm font-semibold text-gray-500">Belum ada dokumen yang diarsipkan</p>
            <p className="text-xs text-gray-400 mt-1">Arsipkan dokumen yang sudah selesai dari halaman Manajemen Surat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map(doc => {
              const dateStr = new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const hasFile = !!doc.fileUrl;
              return (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition p-3 space-y-3">
                  <div 
                    className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition rounded-lg"
                    onClick={() => hasFile ? handlePreview(doc) : null}
                    title={hasFile ? 'Klik untuk melihat dokumen' : 'Tidak ada file'}
                  >
                    {hasFile ? (
                      <div className="text-center">
                        <i className="fa-regular fa-file-pdf text-red-400 text-3xl"></i>
                        <p className="text-[9px] text-gray-400 mt-1.5">Klik untuk preview</p>
                      </div>
                    ) : (
                      <i className="fa-regular fa-file text-gray-300 text-3xl"></i>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-gray-900 truncate" title={doc.judul}>{doc.judul}</p>
                    <p className="text-[10px] text-gray-400">{dateStr} • {doc.noBerkas}</p>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-indigo-900 text-white font-bold text-[9px] flex items-center justify-center">
                      {doc.author.name.substring(0, 2).toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-2">
                      {hasFile && (
                        <button onClick={() => handleDownload(doc)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer" title="Download">
                          <i className="fa-solid fa-download"></i>
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">DAFTAR ARSIP LENGKAP</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800">
            <thead className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Nama Dokumen</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4">Tanggal Arsip</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredDocuments.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">Belum ada arsip dokumen.</td></tr>
              ) : filteredDocuments.map(doc => {
                const hasFile = !!doc.fileUrl;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center space-x-2">
                      <i className={`fa-regular ${hasFile ? 'fa-file-pdf text-red-600' : 'fa-file text-gray-400'} text-sm`}></i>
                      <span className="truncate max-w-[200px]">{doc.judul}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 truncate max-w-[150px]">{doc.lokasi}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{doc.author.name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center space-x-1"><i className="fa-regular fa-circle-check"></i><span>TERARSIP</span></span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {hasFile && (
                          <button onClick={() => handlePreview(doc)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition cursor-pointer" title="Preview">
                            <i className="fa-solid fa-eye text-[11px]"></i>
                          </button>
                        )}
                        {hasFile && (
                          <button onClick={() => handleDownload(doc)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition cursor-pointer" title="Download">
                            <i className="fa-solid fa-download text-[11px]"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showViewer && viewerDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-in fade-in py-10 p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-900 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-file-pdf text-red-500 text-xl"></i>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{viewerDoc.judul}</h3>
                  <p className="text-[10px] text-gray-400">{viewerDoc.noBerkas}</p>
                </div>
              </div>
              <button onClick={() => { setShowViewer(false); setViewerDoc(null); }} className="text-gray-400 hover:text-white cursor-pointer transition">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 overflow-hidden flex justify-center">
              {viewerDoc.fileUrl ? (
                <iframe 
                  src={`${API_URL.replace('/api', '')}${viewerDoc.fileUrl}`} 
                  className="w-full h-full border-none"
                  title="Document Viewer"
                />
              ) : (
                <div className="flex items-center justify-center text-gray-400">
                  <p>Tidak ada file yang tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FILTER LANJUTAN MODAL */}
      {showAdvancedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in py-10 p-4">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Filter Lanjutan Arsip {isPerkara ? 'Perkara' : 'Sengketa'}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Sesuaikan kriteria pencarian dokumen arsip</p>
              </div>
              <button onClick={() => setShowAdvancedFilter(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Status</label>
                <div className="relative">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-100/50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#190c4d] cursor-pointer"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Proses">Proses</option>
                    <option value="Error">Error</option>
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
