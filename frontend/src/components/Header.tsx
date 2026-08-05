interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-30 h-16">
      <div className="flex items-center space-x-3 md:w-1/2 w-full">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden text-gray-700 hover:text-gray-900 focus:outline-none p-1">
            <i className="fa-solid fa-bars text-lg"></i>
          </button>
        )}
        <div className="relative hidden md:block">
          <select 
            value={localStorage.getItem('modulAktif') === 'perkara' ? 'Perkara (Pengadilan)' : 'Sengketa (Pengaduan)'}
            onChange={(e) => {
              const value = e.target.value === 'Perkara (Pengadilan)' ? 'perkara' : 'sengketa';
              localStorage.setItem('modulAktif', value);
              window.location.reload();
            }}
            className="bg-gray-100 text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none cursor-pointer"
          >
            <option>Sengketa (Pengaduan)</option>
            <option>Perkara (Pengadilan)</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-2.5 top-3 text-[10px] text-gray-500 pointer-events-none"></i>
        </div>
        <div className="relative flex-1 max-w-[200px] md:max-w-none">
          <input type="text" placeholder="Cari..." className="w-full bg-gray-100 text-xs text-gray-700 rounded-lg px-3 md:px-4 py-2 focus:outline-none" />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-2.5 text-[10px] text-gray-400"></i>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={() => alert('Tidak ada notifikasi baru')} className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"><i className="fa-regular fa-bell"></i></button>
        <button onClick={() => alert('Pusat Bantuan ATR/BPN')} className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"><i className="fa-regular fa-circle-question"></i></button>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-700">Admin</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
            <i className="fa-solid fa-user text-sm"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
