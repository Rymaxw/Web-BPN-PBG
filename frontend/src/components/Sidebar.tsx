import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      localStorage.removeItem('modulAktif');
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'fa-border-all' },
    { name: 'Manajemen Surat', path: '/surat', icon: 'fa-envelope' },
    { name: 'Analisis Dokumen', path: '/dokumen', icon: 'fa-chart-simple' },
    { name: 'Arsip Digital', path: '/arsip', icon: 'fa-folder-open' },
    { name: 'Pengaturan', path: '/pengaturan', icon: 'fa-gear' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-5 z-20 shrink-0 h-screen sticky top-0">
      <div className="space-y-8">
        {/* Logo ATR/BPN */}
        <div className="flex items-center space-x-3">
          <img src="/logo-bpn.png" alt="Logo ATR/BPN" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-sm text-gray-900 leading-tight">Kementerian ATR/BPN</h1>
            <p className="text-[11px] text-gray-600 font-medium">Kantor Pertanahan<br/>Kab. Purbalingga</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-3 text-xs">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname === item.path + '/';
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition cursor-pointer ${isActive ? 'bg-[#f59e0b] text-black font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <i className={`fa-solid ${item.icon} text-lg w-6 text-center`}></i>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="flex items-center space-x-3 px-2 py-2 text-red-600 font-bold text-xs hover:bg-red-50 rounded-lg transition cursor-pointer">
        <i className="fa-solid fa-arrow-right-from-bracket text-base w-6 text-center"></i>
        <span>Log Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
