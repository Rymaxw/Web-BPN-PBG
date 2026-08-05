import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!localStorage.getItem('user')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f5] print:bg-white print:h-auto print:overflow-visible font-sans antialiased text-gray-900">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-y-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>
        <main className="p-4 md:p-8 space-y-6 print:p-0 print:space-y-0 print:block w-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
