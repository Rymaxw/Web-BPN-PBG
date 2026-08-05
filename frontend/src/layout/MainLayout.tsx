import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f5] print:bg-white print:h-auto print:overflow-visible font-sans antialiased text-gray-900">
      <div className="print:hidden h-full flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="p-8 space-y-6 print:p-0 print:space-y-0 print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
