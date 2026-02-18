
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'stuuck' && password === 'stuuck77') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      alert("Credenciais inválidas");
    }
  };

  return (
    <Layout title="Acesso Administrativo">
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
        <div className="bg-black text-white p-6 rounded-3xl shadow-2xl">
          <Lock size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Painel do Restaurante</h2>
          <p className="text-gray-500">Entre com suas credenciais de parceiro.</p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Usuário"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-black transition-all text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Senha"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-black transition-all text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Entrar
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default LoginPage;
