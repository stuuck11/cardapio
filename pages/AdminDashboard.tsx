
import React, { useState, useEffect } from 'react';
/* Replaced useHistory with useNavigate for react-router-dom v6 */
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Package, List, Save, Plus, Trash2, 
  LayoutPanelTop, ChevronRight, Image as ImageIcon, 
  Clock, MapPin, PlusCircle, MinusCircle, CheckCircle, Info, LogOut, Edit3, X, CreditCard, Star, DollarSign, Receipt, Globe, CloudOff, CloudCheck,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoreConfig, Product, Category, ProductOption, OptionItem, CreditCard as CreditCardType } from '../types';
import { Modal } from '../components/Modals';

const AdminDashboard: React.FC = () => {
  const { 
    activeCampaignId, config, categories, products, allCampaignIds, cards, orders, isSynced,
    updateCampaignData, setActiveCampaign, addCampaign, formatCurrency, removeCard,
    deleteProduct, deleteCategory
  } = useApp();
  
  /* useNavigate hook instead of useHistory */
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'config' | 'categories' | 'products'>('campaigns');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth !== 'true') navigate('/login');
  }, [navigate]);

  const handleCreateCampaign = () => {
    const nextId = String(allCampaignIds.length + 1);
    addCampaign(nextId);
    setActiveCampaign(nextId);
    setActiveTab('config');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newConfig: StoreConfig = {
      ...config,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      openingHours: formData.get('openingHours') as string,
      deliveryFee: parseFloat(formData.get('deliveryFee') as string),
      bannerUrl: formData.get('bannerUrl') as string,
      logoUrl: formData.get('logoUrl') as string,
      isOpen: config.isOpen,
      minOrder: parseFloat(formData.get('minOrder') as string) || 0,
      primaryColor: formData.get('primaryColor') as string || '#000000',
      gateway: formData.get('gateway') as any || 'asaas',
      dailySuggestionId: formData.get('dailySuggestionId') as string || config.dailySuggestionId,
      metaPixelId: formData.get('metaPixelId') as string || '',
      metaCapiToken: formData.get('metaCapiToken') as string || ''
    };
    updateCampaignData(activeCampaignId, { config: newConfig });
    alert("Configurações da loja salvas com sucesso!");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    let newProducts;
    const exists = products.find(p => p.id === editingProduct.id);
    if (exists) {
      newProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      newProducts = [...products, { ...editingProduct, id: newId }];
    }
    updateCampaignData(activeCampaignId, { products: newProducts });
    setEditingProduct(null);
  };

  const handleAddCategory = () => {
    const name = prompt("Nome da nova categoria:");
    if (name) {
      const newCats = [...categories, { id: Math.random().toString(36).substr(2, 9), name, order: categories.length + 1 }];
      updateCampaignData(activeCampaignId, { categories: newCats });
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const newCats = categories.map(c => c.id === editingCategory.id ? editingCategory : c);
    updateCampaignData(activeCampaignId, { categories: newCats });
    setEditingCategory(null);
  };

  const removeCategory = (id: string) => {
    if (confirm("Deseja excluir esta categoria e todos os seus produtos?")) {
      deleteCategory(id);
    }
  };

  const removeProduct = (id: string) => {
    if(confirm("Deseja realmente excluir este produto?")) {
      deleteProduct(id);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      name: `${product.name} (Cópia)`
    };
    const newProducts = [...products, newProduct];
    updateCampaignData(activeCampaignId, { products: newProducts });
  };

  const handleDeleteCard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir as informações deste cartão?")) {
      removeCard(id);
    }
  };

  const paidOrders = orders.filter(o => o.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 overflow-x-hidden">
      <aside className="w-72 bg-white border-r flex flex-col fixed inset-y-0 shadow-sm z-10">
        <div className="p-8 border-b flex items-center gap-3"><div className="bg-black text-white p-2 rounded-xl"><Settings size={24} /></div><h1 className="font-extrabold text-xl tracking-tight text-black">Admin</h1></div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Dashboard Geral</p>
          <NavItem active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<LayoutPanelTop size={20}/>} label="Minhas Lojas" />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Configurar Loja #{activeCampaignId}</p>
            <NavItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={20}/>} label="Branding e Geral" />
            <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<List size={20}/>} label="Categorias" />
            <NavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20}/>} label="Produtos e Itens" />
          </div>
        </nav>
        <div className="p-6 border-t space-y-3">
          <div className="bg-white border p-4 rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Logado como</p>
              <p className="text-sm font-bold truncate text-black">stuuck</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isSynced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500 animate-bounce'}`} title={isSynced ? "Sincronizado" : "Desconectado"} />
          </div>
          <button onClick={() => { localStorage.removeItem('admin_auth'); navigate('/'); }} className="w-full flex items-center justify-center gap-2 p-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"><LogOut size={18} /> Sair do Painel</button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <header className="flex justify-between items-center mb-12">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-gray-500 font-medium">Gerenciando: <span className="text-black font-bold">#{activeCampaignId} - {config.name}</span></p>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSynced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                  {isSynced ? <CloudCheck size={14}/> : <CloudOff size={14}/>}
                  {isSynced ? "Banco de Dados Online" : "Banco de Dados Offline"}
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-black">{activeTab === 'campaigns' && "Minhas Lojas (Campanhas)"}{activeTab === 'config' && "Branding e Configurações"}{activeTab === 'categories' && "Categorias do Cardápio"}{activeTab === 'products' && "Produtos e Complementos"}</h2>
            </div>
            {activeTab === 'campaigns' && (<button onClick={handleCreateCampaign} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={20} /> Criar Nova Loja</button>)}
            {activeTab === 'products' && !editingProduct && (<button onClick={() => setEditingProduct({ id: '', categoryId: categories[0]?.id || '', name: '', description: '', price: 0, imageUrl: '', options: [] })} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={20} /> Novo Produto</button>)}
          </header>

          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{allCampaignIds.map(id => (<div key={id} onClick={() => setActiveCampaign(id)} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer group hover:shadow-2xl ${activeCampaignId === id ? 'border-black bg-black text-white' : 'border-white bg-white hover:border-gray-200'}`}><div className="flex justify-between items-start mb-6"><div className={`p-4 rounded-2xl ${activeCampaignId === id ? 'bg-white/10' : 'bg-gray-100'}`}><LayoutPanelTop size={28} /></div>{activeCampaignId === id && <CheckCircle size={24} className="text-green-400" />}</div><h4 className={`text-xl font-bold mb-1 ${activeCampaignId === id ? 'text-white' : 'text-black'}`}>Loja #{id}</h4><p className={activeCampaignId === id ? 'text-white/60' : 'text-gray-500 font-medium'}>Unidade: {id === activeCampaignId ? config.name : `ID ${id}`}</p></div>))}</div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-10 pb-20">
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-black"><Info size={20}/> Dados da Loja</h3>
                    <FormGroup label="Nome Fantasia" name="name" initialValue={config.name} />
                    <FormGroup label="Endereço Completo" name="address" initialValue={config.address} />
                    <FormGroup label="Horário de Funcionamento" name="openingHours" initialValue={config.openingHours} help="Ex: 17:00 às 23:00" />
                    <FormGroup label="Taxa de Entrega (R$)" name="deliveryFee" initialValue={config.deliveryFee.toString()} type="number" />
                    <FormGroup label="Valor Mínimo do Pedido (R$)" name="minOrder" initialValue={config.minOrder.toString()} type="number" />
                    <div className="space-y-1 w-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gateway de Pagamento</label>
                      <select name="gateway" defaultValue={config.gateway || 'asaas'} className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-black font-semibold outline-none focus:border-black transition-all">
                        <option value="asaas">Asaas (Padrão)</option>
                        <option value="mercado_pago">Mercado Pago</option>
                        <option value="manual">Manual / WhatsApp</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-black"><ImageIcon size={20}/> Branding e Imagens</h3>
                    <FormGroup label="Link da Imagem de Capa" name="bannerUrl" initialValue={config.bannerUrl} help="Tamanho recomendado: 1200x400 pixels" />
                    <FormGroup label="Link da Imagem de Perfil" name="logoUrl" initialValue={config.logoUrl} help="Tamanho recomendado: 512x512 pixels" />
                    <FormGroup label="Cor Principal" name="primaryColor" initialValue={config.primaryColor} type="color" />
                    
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-black pt-4"><Globe size={20}/> Integrações</h3>
                    <FormGroup label="ID do Pixel da Meta" name="metaPixelId" initialValue={config.metaPixelId} help="Ex: 123456789012345" />
                    <FormGroup label="Access Token CAPI (Meta)" name="metaCapiToken" initialValue={config.metaCapiToken} help="Token de acesso do Conversion API" />
                    
                    <div className="space-y-1 w-full pt-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto Sugestão do Dia</label>
                      <select name="dailySuggestionId" defaultValue={config.dailySuggestionId} className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-black font-semibold outline-none focus:border-black transition-all">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-6"><button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-gray-900 transition-all"><Save size={24} /> Atualizar Unidade #{activeCampaignId}</button></div>
                </form>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-black mb-6"><CreditCard size={20}/> Cartões Cadastrados (Clique para ver detalhes)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.length === 0 ? (
                    <p className="text-gray-400 font-medium italic col-span-2">Nenhum cartão cadastrado pelos usuários ainda.</p>
                  ) : (
                    cards.map((card) => (
                      <div 
                        key={card.id} 
                        className="p-4 bg-white border rounded-2xl flex items-center gap-4 hover:border-black transition-all group relative cursor-pointer"
                        onClick={() => setSelectedCard(card)}
                      >
                        <div className="bg-black p-2.5 rounded-xl text-white"><CreditCard size={20} /></div>
                        <div>
                          <p className="font-bold text-black">**** **** **** {card.number.slice(-4)}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{card.name}</p>
                        </div>
                        <div className="ml-auto text-[10px] font-bold text-gray-400 pr-10">{card.expiry}</div>
                        <button 
                          onClick={(e) => handleDeleteCard(e, card.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 p-2 transition-colors"
                          title="Excluir Cartão"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-black mb-6"><Receipt size={20}/> Pedidos Realizados (Log de Vendas)</h3>
                <div className="space-y-3">
                  {paidOrders.length === 0 ? (
                    <p className="text-gray-400 font-medium italic">Nenhum pedido processado ainda.</p>
                  ) : (
                    paidOrders.map((order) => (
                      <div key={order.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="bg-green-100 text-green-700 p-2.5 rounded-xl"><DollarSign size={20}/></div>
                           <div>
                              <p className="font-bold text-black">Pedido #{order.id}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(order.date).toLocaleString()}</p>
                           </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-black">{formatCurrency(order.total)}</p>
                            <span className="text-[9px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full uppercase">Pago via {order.paymentMethod}</span>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">{editingCategory ? (<div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 animate-fade-in"><h3 className="text-xl font-bold mb-6 text-black">Editar Categoria</h3><form onSubmit={handleUpdateCategory} className="space-y-6"><FormGroup label="Nome da Categoria" value={editingCategory.name} onChange={v => setEditingCategory({...editingCategory, name: v})} /><FormGroup label="Ordem" type="number" value={editingCategory.order.toString()} onChange={v => setEditingCategory({...editingCategory, order: parseInt(v) || 1})} /><div className="flex gap-4 pt-4"><button type="button" onClick={() => setEditingCategory(null)} className="flex-1 py-4 border-2 border-black rounded-xl font-bold text-black hover:bg-gray-50">Cancelar</button><button type="submit" className="flex-1 py-4 bg-black text-white rounded-xl font-bold shadow-lg">Salvar Categoria</button></div></form></div>) : (<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Ordem</th><th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th><th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th></tr></thead><tbody className="divide-y">{categories.sort((a,b) => a.order - b.order).map((cat) => (<tr key={cat.id} className="hover:bg-gray-50 transition-colors"><td className="px-8 py-6 font-bold text-gray-500">#{cat.order}</td><td className="px-8 py-6 font-bold text-lg text-black">{cat.name}</td><td className="px-8 py-6 text-right space-x-2"><button onClick={() => setEditingCategory(cat)} className="text-black hover:bg-gray-100 p-3 rounded-xl transition-all inline-flex items-center"><Edit3 size={20} /></button><button onClick={() => removeCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all inline-flex items-center"><Trash2 size={20} /></button></td></tr>))}</tbody></table><div className="p-8 bg-gray-50 border-t"><button onClick={handleAddCategory} className="w-full py-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"><PlusCircle size={22} /> Nova Categoria</button></div></div>)}</div>
          )}

          {activeTab === 'products' && (
            editingProduct ? (
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"><div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-bold text-black">Editar Produto</h3><button onClick={() => setEditingProduct(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all text-black"><XIcon size={20}/></button></div><form onSubmit={handleSaveProduct} className="space-y-10"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><FormGroup label="Nome do Produto" value={editingProduct.name} onChange={v => setEditingProduct({...editingProduct, name: v})} /><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</label><select className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-black font-semibold outline-none focus:border-black transition-all" value={editingProduct.categoryId} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><FormGroup label="Preço Atual (R$)" type="number" value={editingProduct.price.toString()} onChange={v => setEditingProduct({...editingProduct, price: parseFloat(v) || 0})} /><FormGroup label="Preço Antigo (R$ - Opcional)" type="number" value={(editingProduct.oldPrice || 0).toString()} onChange={v => setEditingProduct({...editingProduct, oldPrice: parseFloat(v) || undefined})} /><div className="flex gap-4"><FormGroup label="Início Oferta (HH:mm)" type="time" value={editingProduct.promoStartTime || ''} onChange={v => setEditingProduct({...editingProduct, promoStartTime: v})} /><FormGroup label="Fim Oferta (HH:mm)" type="time" value={editingProduct.promoEndTime || ''} onChange={v => setEditingProduct({...editingProduct, promoEndTime: v})} /></div><FormGroup label="Link da Imagem" value={editingProduct.imageUrl} onChange={v => setEditingProduct({...editingProduct, imageUrl: v})} help="Tamanho ideal: 400x300 pixels" /><div className="md:col-span-2"><FormGroup label="Descrição" value={editingProduct.description} onChange={v => setEditingProduct({...editingProduct, description: v})} help="Máximo 2 linhas." /></div></div><div className="space-y-6 pt-6 border-t border-gray-100"><div className="flex justify-between items-center"><h4 className="text-xl font-bold text-black">Grupos de Adicionais</h4><button type="button" onClick={() => setEditingProduct({ ...editingProduct, options: [...(editingProduct.options || []), { id: Math.random().toString(), title: 'Adicionais', subtitle: 'Escolha suas opções', minSelection: 0, maxSelection: 10, items: [] }] })} className="text-sm font-bold bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all">+ Adicionar Grupo</button></div><div className="space-y-6">{editingProduct.options?.map((opt, optIdx) => (<div key={opt.id} className="p-8 bg-white rounded-3xl border border-gray-200 space-y-6 relative group/opt shadow-sm"><button type="button" onClick={() => { const newOpts = editingProduct.options?.filter((_, i) => i !== optIdx); setEditingProduct({...editingProduct, options: newOpts}); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button><div className="grid grid-cols-1 md:grid-cols-4 gap-6"><FormGroup label="Título do Grupo" value={opt.title} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].title = v; setEditingProduct({...editingProduct, options: newOpts}); }} /><FormGroup label="Subtítulo do Grupo" value={opt.subtitle} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].subtitle = v; setEditingProduct({...editingProduct, options: newOpts}); }} /><FormGroup label="Mínimo" type="number" value={opt.minSelection.toString()} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].minSelection = parseInt(v) || 0; setEditingProduct({...editingProduct, options: newOpts}); }} /><FormGroup label="Máximo" type="number" value={opt.maxSelection.toString()} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].maxSelection = parseInt(v) || 1; setEditingProduct({...editingProduct, options: newOpts}); }} /></div><div className="space-y-4 pt-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Itens do Grupo</p><div className="space-y-3">{opt.items.map((item, itemIdx) => (<div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"><FormGroup label="Nome Item" value={item.name} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items[itemIdx].name = v; setEditingProduct({...editingProduct, options: newOpts}); }} /><FormGroup label="Legenda Item" value={item.description || ''} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items[itemIdx].description = v; setEditingProduct({...editingProduct, options: newOpts}); }} help="Ex: Lata 350ml" /><FormGroup label="Preço (R$)" type="number" value={item.price.toString()} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items[itemIdx].price = parseFloat(v) || 0; setEditingProduct({...editingProduct, options: newOpts}); }} /><FormGroup label="Ícone URL" value={item.iconUrl || ''} onChange={v => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items[itemIdx].iconUrl = v; setEditingProduct({...editingProduct, options: newOpts}); }} help="100x100 pixels" /><div className="flex justify-end"><button type="button" onClick={() => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items.splice(itemIdx, 1); setEditingProduct({...editingProduct, options: newOpts}); }} className="text-red-500 p-3 hover:bg-red-50 rounded-xl"><Trash2 size={20}/></button></div></div>))}</div><button type="button" onClick={() => { const newOpts = [...(editingProduct.options || [])]; newOpts[optIdx].items.push({ id: Math.random().toString(), name: '', price: 0 }); setEditingProduct({...editingProduct, options: newOpts}); }} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"><PlusCircle size={18} /> Adicionar Item ao Grupo</button></div></div>))}</div></div><div className="flex gap-4 pt-10 sticky bottom-0 bg-white py-6 border-t z-10"><button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-5 border-2 border-black rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all text-black">Cancelar</button><button type="submit" className="flex-[2] py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-gray-900 transition-all">Salvar Alterações</button></div></form></div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-3xl border-2 border-yellow-200 p-8 shadow-sm mb-8 animate-fade-in">
                   <div className="flex items-center gap-3 mb-4">
                      <Star className="text-yellow-600 fill-yellow-600" size={24} />
                      <h3 className="text-xl font-extrabold text-yellow-900 uppercase tracking-tight">Configuração: Sugestão do dia</h3>
                   </div>
                   {config.dailySuggestionId ? (
                     <div className="bg-white p-5 rounded-2xl border border-yellow-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <img src={products.find(p => p.id === config.dailySuggestionId)?.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
                           <div>
                              <p className="font-bold text-black">{products.find(p => p.id === config.dailySuggestionId)?.name}</p>
                              <p className="text-xs font-medium text-gray-500">Este item aparecerá com destaque no checkout.</p>
                           </div>
                        </div>
                        <button onClick={() => setEditingProduct(products.find(p => p.id === config.dailySuggestionId) || null)} className="px-4 py-2 bg-yellow-600 text-white rounded-xl text-xs font-bold hover:bg-yellow-700">Editar Item</button>
                     </div>
                   ) : (
                     <p className="text-yellow-800 text-sm font-medium">Nenhuma sugestão configurada no Branding.</p>
                   )}
                </div>

                {categories.sort((a,b) => a.order - b.order).map(cat => { const catProducts = products.filter(p => p.categoryId === cat.id); const isExpanded = expandedCategory === cat.id; return (<div key={cat.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"><button onClick={() => setExpandedCategory(isExpanded ? null : cat.id)} className="w-full px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-black" /><h4 className="font-bold text-lg text-black">{cat.name}</h4><span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{catProducts.length} itens</span></div><ChevronRight className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} size={20} /></button>{isExpanded && (<div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 bg-gray-50/30 animate-fade-in">{catProducts.length === 0 ? (<p className="col-span-full text-center py-10 text-gray-400 text-sm italic">Nenhum produto cadastrado nesta categoria.</p>) : (catProducts.map(p => (<div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 group hover:shadow-xl transition-all"><img src={p.imageUrl} className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-gray-100" alt="" /><div className="flex-1 min-w-0"><div className="flex justify-between items-start mb-1"><h4 className="font-bold text-lg text-black truncate">{p.name}</h4><span className="font-extrabold text-green-600 shrink-0">{formatCurrency(p.price)}</span></div><p className="text-xs text-gray-400 line-clamp-2 mb-4 font-medium">{p.description}</p><div className="flex gap-2"><button onClick={() => setEditingProduct(p)} className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all">Editar</button><button onClick={() => handleDuplicateProduct(p)} className="p-2.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl" title="Duplicar"><Copy size={18}/></button><button onClick={() => removeProduct(p.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl ml-auto"><Trash2 size={18}/></button></div></div></div>)))}</div>)}</div>); })}
              </div>
            )
          )}
        </div>
      </main>

      <Modal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} title="Dados do Cartão" centered>
        {selectedCard && (
          <div className="space-y-6 text-black animate-fade-in p-2">
            <div className="bg-black text-white p-8 rounded-2xl space-y-8 shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
                     <CreditCard size={20} />
                  </div>
               </div>
               <p className="text-2xl font-mono tracking-[0.2em]">{selectedCard.number}</p>
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] text-gray-400 uppercase font-bold">Titular</p>
                     <p className="font-bold uppercase tracking-wider">{selectedCard.name}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[10px] text-gray-400 uppercase font-bold">Validade</p>
                     <p className="font-bold">{selectedCard.expiry}</p>
                  </div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">CPF do Titular</span>
                  <span className="text-sm font-extrabold text-black">{selectedCard.cpf || 'Não informado'}</span>
               </div>
               <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Código de Segurança (CVV)</span>
                  <span className="text-xl font-extrabold text-black">{selectedCard.cvv}</span>
               </div>
               <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic text-center">Dados confidenciais de pagamento</p>
            </div>
            <button onClick={() => setSelectedCard(null)} className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-xl hover:bg-gray-900 transition-colors">Fechar Visualização</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>{icon} <span>{label}</span>{active && <ChevronRight size={16} className="ml-auto" />}</button>
);

const FormGroup: React.FC<{ label: string, name?: string, initialValue?: string, value?: string, onChange?: (v: string) => void, help?: string, type?: string }> = ({ label, name, initialValue, value, onChange, help, type = 'text' }) => (
  <div className="space-y-1 w-full"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label><input name={name} defaultValue={initialValue} value={value} onChange={e => onChange?.(e.target.value)} type={type} className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-black font-semibold outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />{help && <p className="text-[10px] text-gray-500 font-medium">{help}</p>}</div>
);

const XIcon: React.FC<{ size: number }> = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default AdminDashboard;
