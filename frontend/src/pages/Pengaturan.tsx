import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [userProfile, setUserProfile] = useState({ id: '', name: 'Admin', email: '', role: 'staff' });
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserProfile(parsed);
      } catch (e) {}
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Gagal mengambil data user");
    }
  };

  useEffect(() => {
    if (activeTab === 'manajemen' && userProfile.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, userProfile.role]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        alert('Role berhasil diubah!');
        fetchUsers();
      } else {
        alert('Gagal mengubah role.');
      }
    } catch (error) {
      alert('Terjadi kesalahan server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-500 font-medium">
        Pengaturan &gt; <span className="text-gray-900 font-semibold">{activeTab === 'profil' ? 'Profil Saya' : 'Manajemen Pengguna'}</span>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-colors duration-300 overflow-hidden">
        
        {/* Tabs Header */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`px-6 py-4 text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer ${activeTab === 'profil' ? 'text-[#190c4d] border-b-2 border-[#190c4d] bg-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <i className="fa-regular fa-user"></i>
            <span>Profil Saya</span>
          </button>
          
          {userProfile.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('manajemen')}
              className={`px-6 py-4 text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer ${activeTab === 'manajemen' ? 'text-[#190c4d] border-b-2 border-[#190c4d] bg-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              <i className="fa-solid fa-users-gear"></i>
              <span>Manajemen Pengguna</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profil' && (
            <div className="space-y-8 max-w-2xl animate-in fade-in">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#190c4d] border-b pb-2 border-gray-200">Detail Pengguna</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama Lengkap</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={userProfile.name} disabled />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role Akun</label>
                    <div className="w-full bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-lg px-3 py-2 text-sm uppercase">
                      {userProfile.role}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Email / NIP</label>
                    <input type="email" className="w-full bg-gray-200 border border-gray-300 text-gray-500 rounded-lg px-3 py-2 text-sm" value={userProfile.email} disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#190c4d] border-b pb-2 border-gray-200">Preferensi Notifikasi</h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Notifikasi Desktop</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tampilkan pop-up notifikasi saat ada perubahan status berkas.</p>
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
          )}

          {activeTab === 'manajemen' && userProfile.role === 'admin' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Daftar Pengguna Sistem</h3>
              
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs text-gray-800">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Email / NIP</th>
                      <th className="py-3 px-4">Role Saat Ini</th>
                      <th className="py-3 px-4 text-center">Ubah Hak Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-[#190c4d] text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {u.id === userProfile.id ? (
                            <span className="text-[10px] text-gray-400 font-medium italic">Akun Anda</span>
                          ) : (
                            <select 
                              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#190c4d] cursor-pointer"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">Memuat data pengguna...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Pengaturan;
