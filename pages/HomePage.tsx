
import React, { useState, useEffect, useRef } from 'react';
/* Replaced useHistory with useNavigate for react-router-dom v6 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Info, MapPin, Bike, ShoppingBag, ChevronRight, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { DeliveryModal, ProductDetailModal, Modal } from '../components/Modals';
import { Product } from '../types';
import { metaService } from '../services/meta';

const HomePage: React.FC = () => {
  const { campaignId: paramId } = useParams<{ campaignId: string }>();
  const campaignId = paramId || '1';
  const location = useLocation();
  /* useNavigate instead of useHistory */
  const navigate = useNavigate();
  const { config, categories, products, user, setActiveCampaign, formatCurrency, isStoreOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(isStoreOpen());
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setActiveCampaign(campaignId);
    
    // Inicia Pixel se ID existir através do serviço centralizado
    if (config.metaPixelId) {
      metaService.init(config.metaPixelId);
      metaService.trackEvent('PageView', {
        pixelId: config.metaPixelId,
        accessToken: config.metaCapiToken || '',
        originUrl: window.location.href,
        contentName: config.name,
        email: user?.phone ? `${user.phone.replace(/\D/g, '')}@japabox.com.br` : undefined,
        phone: user?.phone
      });
    }
  }, [campaignId, setActiveCampaign, location.search, user, config.metaPixelId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpenNow(isStoreOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, [isStoreOpen]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    setIsMenuOpen(false);
    const element = categoryRefs.current[id];
    if (element) {
      const offset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const availableCategories = categories.filter(cat => 
    filteredProducts.some(p => p.categoryId === cat.id)
  );

  return (
    <Layout>
      {/* Header 'Buscar no cardápio' fixo no topo com z-index alto */}
      <div className="px-4 py-2 bg-white border-b sticky top-0 z-[115] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Buscar no cardápio" className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-[12px] font-medium text-black outline-none placeholder-gray-400 focus:border-black transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="relative">
        <img src={config.bannerUrl} alt="Banner" className="w-full h-40 object-cover" />
        <div className="absolute -bottom-14 left-5">
          <div className="bg-white p-1 rounded-full shadow-lg border w-28 h-28 overflow-hidden">
            <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-16 px-5 space-y-4">
        <div><h2 className="text-2xl font-bold text-black">{config.name}</h2><p className="text-gray-500 text-[12px] font-medium leading-tight">{config.address}</p><button onClick={() => setIsInfoModalOpen(true)} className="mt-1 flex items-center gap-1 text-[12px] text-blue-800 font-bold hover:underline"><span className="text-black">•</span> Mais informações</button></div>
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className={`text-[11px] font-bold leading-tight ${isOpenNow ? 'text-green-600' : 'text-red-500'}`}>
            {isOpenNow ? `Loja aberta até ${config.openingHours.split(' às ')[1] || '23:00'}` : <>Loja Fechada no momento, abre hoje <br/> às {config.openingHours.split(' às ')[0]}</>}
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-tight text-center leading-tight whitespace-nowrap">Entrega e<br/>Retirada</div>
        </div>
        <button onClick={() => setIsDeliveryModalOpen(true)} className="w-full p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-2.5"><div className="bg-gray-50 p-1.5 rounded-full"><MapPin size={16} className="text-black" /></div><div className="text-left"><span className="block font-bold text-[11px] text-black">{user?.address ? (user.address.type === 'delivery' ? user.address.street : 'Retirada no local') : 'Calcular taxa de entrega'}</span><span className="block text-[9px] text-gray-400 font-medium">{user?.address ? (user.address.type === 'delivery' ? `60-90 min / ${formatCurrency(config.deliveryFee)}` : config.address) : 'Toque para selecionar'}</span></div></div><ChevronRight size={16} className="text-gray-300" /></button>
      </div>
      {/* Sticky categories bar fixado logo abaixo do header de busca */}
      <div className="mt-5 sticky top-[44px] z-[110] bg-white border-b flex items-center shadow-sm h-12">
        <div className="relative h-full"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="px-4 border-r h-full flex items-center"><Menu size={18} className="text-black" /></button>{isMenuOpen && (<><div className="fixed inset-0 z-[140] bg-transparent" onClick={() => setIsMenuOpen(false)}/><div className="absolute top-full left-4 z-[150] mt-1 bg-white w-64 max-h-80 rounded-lg shadow-xl border border-gray-100 overflow-y-auto animate-fade-in flex flex-col p-1">{availableCategories.map(cat => (<button key={cat.id} onClick={() => scrollToCategory(cat.id)} className="w-full text-left px-4 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b last:border-0 border-gray-50">{cat.name}</button>))}</div></>)}</div>
        <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-5 px-4 h-full">{availableCategories.map(cat => (<button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`whitespace-nowrap py-3 text-[10px] font-bold uppercase tracking-wider relative h-full flex items-center ${activeCategory === cat.id ? 'text-black' : 'text-gray-400'}`}>{cat.name}{activeCategory === cat.id && (<div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />)}</button>))}</div>
      </div>
      <div className="px-4 py-4 space-y-6">{availableCategories.map(cat => { const catProducts = filteredProducts.filter(p => p.categoryId === cat.id); return (<div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }} className="pt-2"><h3 className="text-[13px] font-bold text-gray-800 mb-3 px-1 uppercase tracking-tight">{cat.name}</h3><div className="space-y-2">{catProducts.map(product => (<button key={product.id} onClick={() => setSelectedProduct(product)} className="w-full bg-white p-3 rounded-xl border border-gray-50 flex items-center gap-3 text-left group transition-all active:scale-[0.98]"><div className="flex-1 space-y-0.5 min-w-0"><h4 className="font-bold text-[13px] text-black group-hover:underline">{product.name}</h4>{product.description && (<p className="text-gray-400 text-[10px] font-medium line-clamp-2 leading-relaxed">{product.description.length > 60 ? product.description.substring(0, 57) + "..." : product.description}</p>)}<p className="text-[11px] font-bold text-gray-800 pt-1">{formatCurrency(product.price)}</p></div><div className="shrink-0 rounded-lg border border-gray-100 overflow-hidden w-16 h-16"><img src={product.imageUrl} className="w-full h-full object-cover" alt="" /></div></button>))}</div></div>);})}</div>

      <DeliveryModal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} />
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Informações"><div className="bg-white p-4 rounded-xl border space-y-2.5 text-[11px] font-medium text-black"><p className="flex justify-between"><span className="text-gray-400">Nome:</span> <span className="font-bold">{config.name}</span></p><p className="flex justify-between flex-col gap-0.5"><span className="text-gray-400">Endereço:</span> <span className="font-bold">{config.address}</span></p><p className="flex justify-between"><span className="text-gray-400">Horário:</span> <span className="font-bold">{config.openingHours}</span></p></div></Modal>
      <ProductDetailModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
    </Layout>
  );
};

export default HomePage;
