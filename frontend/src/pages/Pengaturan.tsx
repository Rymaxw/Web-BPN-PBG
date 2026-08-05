import { useState, useEffect } from 'react';

const Pengaturan = () => {
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: 'Admin Kantor Pertanahan', email: 'admin@bpn.go.id' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserProfile({ name: parsed.name, email: parsed.email });
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-500 font-medium">
        Pengaturan &gt; <span className="text-gray-900 font-semibold">Sistem</span>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pengaturan Sistem BPN</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profil */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#190c4d] border-b pb-2 border-gray-200">Profil Pengguna</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email / Akun (Kantor Wilayah Kab. Purbalingga)</label>
              <input type="email" className="w-full bg-gray-200 border border-gray-300 text-gray-500 rounded-lg px-3 py-2 text-sm" value={userProfile.email} disabled />
            </div>
          </div>

          {/* Preferensi */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#190c4d] border-b pb-2 border-gray-200">Preferensi Dashboard</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Notifikasi Desktop</p>
                <p className="text-xs text-gray-500">Tampilkan pop-up notifikasi untuk berkas SLA kritis.</p>
              </div>
              <div 
                onClick={() => setIsNotifEnabled(!isNotifEnabled)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${isNotifEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${isNotifEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-[#190c4d] hover:bg-indigo-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg cursor-pointer transition shadow-sm">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
