
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, ChevronLeft, X, CreditCard, LogOut, ShieldCheck, ShoppingBag, ChevronRight, CloudOff, CloudCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardRegistrationModal, Modal } from './Modals';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeCampaignId, cart, formatCurrency, config, clearCart, removeFromCart, isSynced } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navItems = [
    { icon: <Home size={18} />, label: 'Home', path: `/c/${activeCampaignId}/home` },
    { icon: <ClipboardList size={18} />, label: 'Pedidos', path: '/orders' },
    { icon: <User size={18} />, label: 'Perfil', path: '#profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '#profile') {
      setIsProfileOpen(true);
    } else {
      navigate(path);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitante';
  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);

  // Não mostrar barra de sacola no checkout
  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative overflow-x-hidden flex flex-col">
      {/* Botão Admin Sandbox */}
      <button 
        onClick={() => navigate('/login')}
        className="fixed bottom-32 right-4 z-[99] bg-gray-800 text-white/50 p-2.5 rounded-full shadow-lg hover:text-white transition-colors"
        title="Admin"
      >
        <ShieldCheck size={18} />
      </button>

      {title && (
        <header className="sticky top-0 z-[55] bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={() => navigate(-1)} className="p-1 text-black">
                <ChevronLeft size={20} />
              </button>
            )}
            <h1 className="font-bold text-[12px] text-black uppercase tracking-tight">{title}</h1>
          </div>
          
          {/* Indicador de Sincronização */}
          <div className="flex items-center gap-1.5" title={isSynced ? "Sincronizado com servidor" : "Modo Offline"}>
            <div className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
              {isSynced ? "On" : "Off"}
            </span>
          </div>
        </header>
      )}

      <main className="text-black flex-1 relative">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Profile Side Drawer */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-black/50 transition-opacity"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[40%] bg-white z-[130] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isProfileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-[11px] text-black uppercase tracking-widest">Minha Conta</h3>
          <button 
            onClick={() => setIsProfileOpen(false)}
            className="p-1.5 bg-gray-100 rounded-full text-black"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 p-5 space-y-6 text-black">
          <div className="space-y-0.5">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Bem-vindo(a),</p>
            <h4 className="text-base font-bold text-black">Olá, {firstName}</h4>
          </div>

          <div className="space-y-2.5">
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                setIsCardModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="bg-gray-100 p-2 rounded-full text-black">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="font-bold text-[11px] text-black">Formas de pagamento</p>
                <p className="text-[9px] text-gray-400">Gerencie seus cartões</p>
              </div>
            </button>

            <button 
              onClick={() => setIsProfileOpen(false)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-red-50 transition-colors text-left"
            >
              <div className="bg-red-50 p-2 rounded-full text-red-600">
                <LogOut size={16} />
              </div>
              <div>
                <p className="font-bold text-[11px] text-red-600">Sair</p>
                <p className="text-[9px] text-red-400">Encerrar sessão</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER AREA: Cart Bar + Nav Bar Stacker */}
      <div className="h-12"></div> {/* Spacer base */}
      {cart.length > 0 && !isCheckoutPage && <div className="h-12"></div>} {/* Spacer extra se houver sacola e não for checkout */}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-md z-[110] flex flex-col pointer-events-none">
        {/* VER SACOLA BAR - Attached directly above footer nav */}
        {cart.length > 0 && !isCheckoutPage && (
          <div className="w-full px-0 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] pointer-events-auto">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="w-full bg-black text-white h-12 flex items-center px-6 active:bg-gray-900 transition-colors border-b border-white/10"
            >
              <ShoppingBag size={20} />
              <span className="flex-1 text-center font-bold text-[13px] uppercase tracking-wide">Ver sacola</span>
              <span className="font-bold text-[13px]">{formatCurrency(cartTotal)}</span>
            </button>
          </div>
        )}

        {/* NAVIGATION FOOTER */}
        <footer className="w-full h-12 bg-white border-t flex justify-around items-center pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center gap-0.5 transition-all ${
                (location.pathname === item.path) || (item.path === '#profile' && isProfileOpen) 
                  ? 'text-black' 
                  : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </footer>
      </div>

      {/* Cart Modal moved to global layout for persistence */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Sua Sacola">
        <div className="space-y-4 flex flex-col h-full min-h-[400px] text-black">
          <div className="flex justify-between border-b pt-4 pb-3 px-4 items-center">
            <span className="font-bold text-gray-400 uppercase text-[9px]">Itens</span>
            <button onClick={clearCart} className="text-[9px] text-red-500 font-bold uppercase">Limpar</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-xl relative group">
                <div className="flex-1">
                  <p className="font-bold text-[12px]">{item.quantity}x {item.name}</p>
                  <div className="text-[10px] text-gray-400">{item.selectedOptions.map(o => o.items.map(i => i.name)).join(', ')}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-[11px]">{formatCurrency(item.totalPrice * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-[10px] font-bold uppercase hover:bg-red-50 p-1 rounded transition-colors">Remover</button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-4 border-t pb-4">
            <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 mx-auto w-[88%]">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-bold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Taxa de entrega</span>
                <span className="font-bold">{user?.address?.type === 'pickup' ? 'Grátis' : formatCurrency(config.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-black border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(cartTotal + (user?.address?.type === 'pickup' ? 0 : config.deliveryFee))}</span>
              </div>
            </div>
            <button 
              onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} 
              className="w-[88%] mx-auto py-3.5 bg-black text-white rounded-xl font-bold text-[13px] flex justify-between px-6 shadow-xl active:scale-[0.98] transition-all"
            >
              <span>Continuar</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Modal>

      <CardRegistrationModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />
    </div>
  );
};

export default Layout;
