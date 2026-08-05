import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'select_module'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Login gagal.');
        setIsLoading(false);
        return;
      }

      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsLoading(false);
      setStep('select_module');
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      setIsLoading(false);
    }
  };

  const handleSelectModule = (tipe: 'sengketa' | 'perkara') => {
    localStorage.setItem('modulAktif', tipe);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transition-all">
        
        <div className="text-center mb-8">
          <img 
            src="/logo-bpn.png" 
            alt="Logo BPN" 
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kementerian ATR/BPN</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Manajemen Sengketa & Perkara</p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center space-x-2 border border-red-200">
                <i className="fa-solid fa-circle-exclamation text-base"></i>
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">NIP / Email</label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#190c4d] focus:border-transparent transition"
                placeholder="Masukkan NIP atau Email"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#190c4d] focus:border-transparent transition"
                  placeholder="Masukkan Kata Sandi"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#190c4d] hover:bg-indigo-950 text-white font-bold py-2.5 rounded-lg transition shadow-md flex justify-center items-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Masuk'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <a href="#" className="text-xs font-semibold text-[#190c4d] hover:underline">Lupa Kata Sandi?</a>
            </div>
          </form>
        ) : (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 mb-6 border border-green-200">
              <i className="fa-solid fa-check-circle text-base"></i>
              <span>Autentikasi Berhasil!</span>
            </div>
            
            <p className="text-xs font-bold text-gray-500 text-center mb-3 uppercase tracking-wide">Pilih Modul Akses Ruang Kerja</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSelectModule('sengketa')}
                className="group relative bg-white border-2 border-[#190c4d] hover:bg-[#190c4d] text-[#190c4d] hover:text-white rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
              >
                <i className="fa-solid fa-scale-unbalanced text-3xl mb-3"></i>
                <span className="font-bold text-sm tracking-wide">SENGKETA</span>
              </button>
              
              <button 
                onClick={() => handleSelectModule('perkara')}
                className="group relative bg-white border-2 border-amber-500 hover:bg-amber-500 text-amber-600 hover:text-white rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
              >
                <i className="fa-solid fa-gavel text-3xl mb-3"></i>
                <span className="font-bold text-sm tracking-wide">PERKARA</span>
              </button>
            </div>
            
            <button 
              onClick={() => setStep('login')}
              className="w-full mt-6 text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              &larr; Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
