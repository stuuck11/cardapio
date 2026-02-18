
import React, { useState } from 'react';
import { X, Search, MapPin, Bike, Store, Trash2, Check, Plus, Minus, CreditCard, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Address, Product, CartItem, OptionItem } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  centered?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, centered }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6">
      <div className={`bg-white w-full flex flex-col animate-fade-in shadow-2xl overflow-hidden ${centered ? 'max-w-md h-auto rounded-2xl mx-4 mb-auto sm:mb-0' : 'h-full rounded-t-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl'}`}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 shrink-0">
          <h3 className="font-bold text-lg text-black">{title}</h3>
          <button onClick={onClose} className="p-1.5 bg-gray-100 rounded-full text-black hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 text-black min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const CardRegistrationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cards, addCard, removeCard } = useApp();
  const [step, setStep] = useState<'list' | 'add'>('list');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const maskCardNumber = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 16) v = v.substring(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const maskExpiry = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 4) v = v.substring(0, 4);
    if (v.length > 2) return v.replace(/(\d{2})(\d)/, "$1/$2");
    return v;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    addCard({
      number: cardNumber.replace(/\s/g, ''),
      name: formData.get('name') as string,
      expiry: cardExpiry,
      cvv: cardCvv,
    });
    setStep('list');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cartões de crédito">
      <div className="p-6 h-full flex flex-col">
        {step === 'list' ? (
          <div className="space-y-6 h-full flex flex-col">
            {cards.length === 0 ? (
              <div className="text-center py-20 flex-1 flex flex-col justify-center space-y-4">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <CreditCard size={48} />
                </div>
                <p className="text-gray-500 font-medium text-lg">Nenhum cartão cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {cards.map((card) => (
                  <div key={card.id} className="p-5 border border-gray-100 rounded-2xl flex items-center gap-4 bg-white text-black">
                    <div className="bg-black p-3 rounded-xl text-white">
                      <CreditCard size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">**** **** **** {card.number.slice(-4)}</p>
                      <p className="text-xs text-gray-500 uppercase font-bold">{card.name}</p>
                    </div>
                    <button onClick={() => removeCard(card.id)} className="text-red-500 p-3 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep('add')}
              className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xl shadow-xl active:scale-95 transition-transform mt-auto mb-4"
            >
              Adicionar novo cartão
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddCard} className="space-y-8 text-black h-full flex flex-col">
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Número do Cartão</label>
                <input 
                  name="number" 
                  required 
                  placeholder="0000 0000 0000 0000" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                  className="w-full p-5 border-2 rounded-2xl text-lg font-mono text-black bg-white focus:border-black outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nome Impresso</label>
                <input name="name" required placeholder="Ex: JOÃO SILVA" className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Validade</label>
                  <input 
                    name="expiry" 
                    required 
                    placeholder="MM/AA" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                    className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                  <input 
                    name="cvv" 
                    required 
                    maxLength={3}
                    placeholder="000" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                    className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <button type="button" onClick={() => setStep('list')} className="flex-1 py-5 border-2 border-black rounded-2xl font-bold text-lg text-black hover:bg-gray-50 transition-colors">Voltar</button>
              <button type="submit" className="flex-1 py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-900 transition-colors">Salvar</button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export const DeliveryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, setUser, setAddress, config } = useApp();
  const [step, setStep] = useState<'selection' | 'id' | 'address'>(user ? 'selection' : 'id');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [addrForm, setAddrForm] = useState<Partial<Address>>(user?.address || { type: 'delivery' });

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleIdentification = () => {
    if (name && phone.length >= 14) {
      setUser({ ...user!, name, phone });
      setError('');
      setStep('address');
    } else {
      setError('Por favor, preencha o nome e um telefone válido.');
    }
  };

  const handleFinishAddress = () => {
    if (addrForm.city && addrForm.neighborhood && addrForm.street && addrForm.number) {
      setAddress(addrForm as Address);
      setError('');
      onClose();
    } else {
      setError('Por favor, preencha todos os campos obrigatórios do endereço.');
    }
  };

  const handlePickupSelection = () => {
    setAddress({
      type: 'pickup',
      city: 'Local',
      neighborhood: 'Loja',
      street: config.address,
      number: '',
    } as Address);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identificação">
      <div className="p-6 h-full flex flex-col">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-fade-in">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {step === 'id' && (
          <div className="space-y-10 text-black h-full flex flex-col justify-center">
            <p className="font-bold text-2xl leading-tight">Informe seu número de telefone e seu nome para continuar</p>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Seu Nome</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full p-5 border-2 rounded-2xl outline-none focus:border-black text-lg font-bold text-black bg-white transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Telefone</label>
                <input
                  type="tel"
                  placeholder="(00) 99999-9999"
                  className="w-full p-5 border-2 rounded-2xl outline-none focus:border-black text-lg font-bold text-black bg-white transition-all"
                  value={phone}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>
            <button onClick={handleIdentification} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:bg-gray-900 active:scale-[0.98] mt-4">Continuar</button>
          </div>
        )}
        {step === 'selection' && (
          <div className="space-y-6 text-black h-full flex flex-col justify-center">
            <h4 className="text-2xl font-bold mb-4">Como deseja receber seu pedido?</h4>
            <button onClick={() => setStep('address')} className="w-full flex items-center p-6 border-2 border-gray-100 rounded-2xl gap-5 text-left hover:border-black hover:bg-gray-50 transition-all shadow-sm">
              <div className="bg-blue-100 p-5 rounded-2xl text-blue-600"><Bike size={32} /></div>
              <div><p className="font-bold text-xl">Delivery</p><p className="text-sm text-gray-500 font-medium">Receba no seu endereço</p></div>
            </button>
            <button onClick={handlePickupSelection} className="w-full flex items-center p-6 border-2 border-gray-100 rounded-2xl gap-5 text-left hover:border-black hover:bg-gray-50 transition-all shadow-sm">
              <div className="bg-gray-100 p-5 rounded-2xl text-gray-600"><Store size={32} /></div>
              <div><p className="font-bold text-xl">Retirada na loja</p><p className="text-sm text-gray-500 font-medium">Retire no local</p></div>
            </button>
            {user?.address && (
              <div className="mt-10 pt-8 border-t-2 border-gray-50 text-black">
                <p className="font-bold mb-5 uppercase text-[11px] tracking-widest text-gray-400">Endereço Cadastrado</p>
                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border">
                  <div className="flex-1">
                    <p className="text-lg font-bold">{user.address.street}, {user.address.number}</p>
                    <p className="text-sm text-gray-500 font-medium">{user.address.neighborhood} - {user.address.city}</p>
                  </div>
                  <button className="text-red-500 p-3 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={24} /></button>
                </div>
                <button onClick={() => setStep('id')} className="w-full mt-6 py-4 border-2 border-black rounded-2xl font-bold text-black hover:bg-gray-50 transition-all">Adicionar novo endereço</button>
              </div>
            )}
          </div>
        )}
        {step === 'address' && (
          <div className="space-y-6 text-black h-full flex flex-col">
            <p className="font-bold text-2xl mb-4">Dados de Entrega</p>
            <div className="space-y-4 flex-1">
              <select className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all appearance-none" value={addrForm.city || ''} onChange={(e) => setAddrForm({...addrForm, city: e.target.value})}>
                <option value="">Selecione sua cidade</option>
                <option value="Bebedouro">Bebedouro</option>
                <option value="Sertãozinho">Sertãozinho</option>
              </select>
              <input placeholder="Bairro" className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" value={addrForm.neighborhood || ''} onChange={(e) => setAddrForm({...addrForm, neighborhood: e.target.value})} />
              <div className="flex gap-4">
                <input placeholder="Rua" className="flex-[2] p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" value={addrForm.street || ''} onChange={(e) => setAddrForm({...addrForm, street: e.target.value})} />
                <input placeholder="Nº" className="flex-1 p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all text-center" value={addrForm.number || ''} onChange={(e) => setAddrForm({...addrForm, number: e.target.value})} />
              </div>
              <input placeholder="Complemento (Opcional)" className="w-full p-5 border-2 rounded-2xl text-lg font-bold text-black bg-white focus:border-black outline-none transition-all" value={addrForm.complement || ''} onChange={(e) => setAddrForm({...addrForm, complement: e.target.value})} />
            </div>
            <div className="pt-6 mb-4 space-y-4">
              <button onClick={handleFinishAddress} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-gray-900 transition-all">Salvar e Continuar</button>
              <button onClick={() => setStep('selection')} className="w-full py-3 text-gray-400 font-bold">Voltar</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const ProductDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; product: Product | null }> = ({ isOpen, onClose, product }) => {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);
  const [observation, setObservation] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, Record<string, number>>>({});
  const [error, setError] = useState('');

  if (!product) return null;

  const handleUpdateItemQuantity = (optionId: string, item: OptionItem, delta: number, max: number) => {
    const groupSelections = itemQuantities[optionId] || {};
    const currentGroupTotal = Object.values(groupSelections).reduce((a, b) => a + b, 0);
    const currentItemCount = groupSelections[item.id] || 0;
    
    const nextItemCount = currentItemCount + delta;
    
    if (nextItemCount < 0) return;
    if (delta > 0 && currentGroupTotal >= max) return;
    
    setItemQuantities({
      ...itemQuantities,
      [optionId]: {
        ...groupSelections,
        [item.id]: nextItemCount
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    Object.entries(itemQuantities).forEach(([optId, itemCounts]) => {
      Object.entries(itemCounts).forEach(([itemId, count]) => {
        const itemData = product.options?.find(o => o.id === optId)?.items.find(i => i.id === itemId);
        if (itemData) total += itemData.price * count;
      });
    });
    return total;
  };

  const handleAdd = () => {
    const missing = product.options?.filter(opt => {
        const count = Object.values(itemQuantities[opt.id] || {}).reduce((a, b) => a + b, 0);
        return opt.minSelection > 0 && count < opt.minSelection;
    });

    if (missing && missing.length > 0) {
      setError(`Selecione as opções obrigatórias: ${missing.map(m => m.title).join(', ')}`);
      return;
    }

    const selectedOptions = Object.entries(itemQuantities).map(([optId, itemCounts]) => {
      const items: OptionItem[] = [];
      Object.entries(itemCounts).forEach(([itemId, count]) => {
        const itemData = product.options?.find(o => o.id === optId)?.items.find(i => i.id === itemId);
        if (itemData) {
          for (let i = 0; i < count; i++) items.push(itemData);
        }
      });
      return { optionId: optId, items };
    });

    const cartItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      totalPrice: calculateTotalPrice(),
      quantity: qty,
      observation,
      selectedOptions
    };

    addToCart(cartItem);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="h-full">
        {error && (
          <div className="m-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-fade-in">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        <div className="pb-32 text-black h-full">
          <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover shadow-sm" />
          
          <div className="p-5 space-y-1 bg-white">
            <h2 className="text-xl font-bold text-black">{product.name}</h2>
            <p className="text-gray-500 text-sm leading-tight">{product.description}</p>
            <p className="text-sm font-bold text-gray-800 pt-1">R$ {product.price.toFixed(2).replace('.', ',')}</p>
          </div>

          <div className="space-y-0">
            {product.options?.map(opt => {
              const selectedGroup = itemQuantities[opt.id] || {};
              const selectedCount = Object.values(selectedGroup).reduce((a, b) => a + b, 0);
              const isRequired = opt.minSelection > 0;
              const isComplete = selectedCount >= opt.minSelection;
              
              return (
                <div key={opt.id} className="border-b last:border-0">
                  {/* Cabeçalho do Grupo (Cinza conforme print) */}
                  <div className="bg-[#f0f2f5] px-5 py-4 flex justify-between items-center border-y border-gray-100 mt-2">
                    <div className="space-y-0">
                      <h4 className="font-bold text-gray-800 text-[13px]">{opt.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium -mt-1">{opt.subtitle}</p>
                    </div>
                    {selectedCount > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="bg-green-600 text-white px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-sm">
                                <span className="text-[11px] font-bold">{selectedCount}</span>
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>
                    )}
                  </div>

                  {/* Itens do Grupo */}
                  <div className="divide-y divide-gray-50 bg-white">
                    {opt.items.map(item => {
                      const count = selectedGroup[item.id] || 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center p-5 group transition-colors hover:bg-gray-50/50">
                          <div className="flex-1 space-y-0">
                            <p className="text-[13px] font-bold text-black">{item.name}</p>
                            {item.description && <p className="text-[11px] text-gray-400 font-medium -mt-1">{item.description}</p>}
                            <p className="text-[12px] font-bold text-gray-500 pt-0.5">+ R$ {item.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 ml-4">
                            {item.iconUrl && <img src={item.iconUrl} className="w-12 h-12 rounded-xl object-cover border border-gray-50" alt="" />}
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleUpdateItemQuantity(opt.id, item, -1, opt.maxSelection)}
                                    className={`p-1 text-black transition-opacity ${count === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-100 rounded'}`}
                                >
                                    <Minus size={18} strokeWidth={3} />
                                </button>
                                <span className={`text-[15px] font-bold min-w-[1.2ch] text-center ${count > 0 ? 'text-black' : 'text-gray-300'}`}>{count}</span>
                                <button 
                                    onClick={() => handleUpdateItemQuantity(opt.id, item, 1, opt.maxSelection)}
                                    className={`p-1 text-black transition-opacity ${selectedCount >= opt.maxSelection ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-100 rounded'}`}
                                >
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Observação */}
            <div className="p-5 mt-4 space-y-3">
              <div className="flex justify-between items-center"><h4 className="font-bold text-[13px] text-gray-800 uppercase tracking-tight">Alguma observação?</h4><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{observation.length}/500</span></div>
              <textarea placeholder="Ex: retirar cebolinha, talheres descartáveis, etc." className="w-full p-4 border border-gray-200 rounded-xl h-24 text-sm text-black bg-white focus:border-black transition-all resize-none outline-none font-medium" maxLength={500} value={observation} onChange={(e) => setObservation(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t sm:relative sm:p-0 sm:mt-0 sm:border-0 z-20 shrink-0">
        <div className="flex items-center gap-3 max-w-md mx-auto h-14 flex-nowrap px-2">
          <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50 h-full shrink-0">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 text-black hover:bg-gray-100 transition-colors"><Minus size={18} strokeWidth={3} /></button>
            <span className="px-1 font-extrabold text-lg text-black min-w-[1.5ch] text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="px-4 text-black hover:bg-gray-100 transition-colors"><Plus size={18} strokeWidth={3} /></button>
          </div>
          <button onClick={handleAdd} className="flex-1 h-full bg-black text-white rounded-xl font-bold flex items-center justify-between px-4 gap-2 shadow-xl active:scale-[0.97] transition-all min-w-0">
            <span className="uppercase text-[11px] tracking-tight truncate">Adicionar</span>
            <span className="text-sm shrink-0">R$ {(calculateTotalPrice() * qty).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
