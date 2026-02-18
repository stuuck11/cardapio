
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, QrCode, CreditCard, CheckCircle2, MapPin, Smartphone, X, AlertCircle, Plus, Bike, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modals';
import { Address } from '../types';
import { asaasService } from '../services/asaas';

const CheckoutPage: React.FC = () => {
  const { cart, config, user, setUser, setAddress, createOrder, activeCoupon, formatCurrency, activeCampaignId, products, cards, addCard } = useApp();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [upsellSelected, setUpsellSelected] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pixData, setPixData] = useState<{ encodedImage: string, payload: string } | null>(null);
  
  const [authStep, setAuthStep] = useState<'selection' | 'id' | 'address'>(user?.phone ? 'selection' : 'id');
  const [tempPhone, setTempPhone] = useState(user?.phone || '');
  const [addrForm, setAddrForm] = useState<Partial<Address>>(user?.address || { type: 'delivery' });

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const dailySuggestion = products.find(p => p.id === config.dailySuggestionId) || products[0];

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
  const upsellPrice = dailySuggestion?.price || 12.90;
  const deliveryFee = user?.address?.type === 'pickup' ? 0 : config.deliveryFee;
  const discount = activeCoupon ? (subtotal * (activeCoupon.discountPercentage / 100)) : 0;
  const currentTotal = parseFloat((subtotal + deliveryFee + (upsellSelected ? upsellPrice : 0) - discount).toFixed(2));

  const maskCpf = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  };

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => setCpf(maskCpf(e.target.value));

  const handleIdentificationSubmit = () => {
    if (name && tempPhone.length >= 14) {
      setUser({ ...user!, name, phone: tempPhone });
      setAuthStep('address');
    } else {
      setError('Preencha seu nome e um telefone válido.');
    }
  };

  const handleAddressSubmit = () => {
    if (addrForm.city && addrForm.neighborhood && addrForm.street && addrForm.number) {
      setAddress(addrForm as Address);
      setError('');
    } else {
      setError('Preencha todos os campos do endereço.');
    }
  };

  const handlePay = () => {
    if (!name.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }
    if (cpf.length < 14) {
      setError("Por favor, informe um CPF válido para emissão da nota.");
      return;
    }
    setError('');
    setIsPaymentModalOpen(true);
  };

  const handleSaveCardAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder) {
        setError("Por favor, preencha todos os dados do cartão corretamente.");
        return;
    }
    setError('');
    addCard({
        number: cardNumber.replace(/\s/g, ''),
        name: cardHolder,
        expiry: cardExpiry,
        cvv: cardCvv,
    });
    setShowAddCard(false);
  };

  const confirmPaymentReal = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // 1. Criar/Pegar cliente no Asaas
      const customer = await asaasService.createCustomer({
        name: name,
        cpfCnpj: cpf.replace(/\D/g, ''),
        phone: tempPhone.replace(/\D/g, ''),
        email: `${tempPhone.replace(/\D/g, '')}@japabox.com.br`
      });

      // 2. Preparar Dados do Pagamento
      const paymentData: any = {
        customer: customer.id,
        billingType: method === 'pix' ? 'PIX' : 'CREDIT_CARD',
        value: currentTotal,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: `Pedido Japan Box Express - ${name}`,
        externalReference: `order_${Math.floor(Date.now() / 1000)}`
      };

      if (method === 'card') {
        const lastCard = cards[cards.length - 1];
        if (!lastCard) throw new Error("Cadastre um cartão primeiro.");
        
        paymentData.creditCard = {
          holderName: lastCard.name,
          number: lastCard.number,
          expiryMonth: lastCard.expiry.split('/')[0],
          expiryYear: '20' + lastCard.expiry.split('/')[1],
          ccv: lastCard.cvv
        };
        paymentData.creditCardHolderInfo = {
          name: name,
          email: `${tempPhone.replace(/\D/g, '')}@japabox.com.br`,
          cpfCnpj: cpf.replace(/\D/g, ''),
          postalCode: '14700000',
          addressNumber: addrForm.number || 'SN',
          phone: tempPhone.replace(/\D/g, '')
        };
      }

      const payment = await asaasService.createPayment(paymentData);

      if (method === 'pix') {
        const qrCode = await asaasService.getPixQrCode(payment.id);
        setPixData({ encodedImage: qrCode.encodedImage, payload: qrCode.payload });
        createOrder(method, true);
      } else {
        createOrder(method, true);
        setShowSuccess(true);
        setTimeout(() => navigate('/orders'), 2000);
      }
    } catch (err: any) {
      console.error('[Checkout Debug] Erro:', err);
      let errorMsg = err.message || 'Erro inesperado na transação.';
      if (errorMsg.includes('Failed to fetch')) {
        errorMsg = 'Erro de conexão (CORS/Network). Se estiver no Vercel, certifique-se de fazer o Deploy após configurar a ASAAS_API_KEY.';
      }
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const isIdentified = user?.phone && user?.address;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6 text-black">
        <CheckCircle2 size={64} className="text-green-500 animate-bounce" />
        <h2 className="text-2xl font-bold">Pedido Confirmado!</h2>
        <p className="text-gray-500 text-sm">Seu pagamento foi processado com sucesso.</p>
      </div>
    );
  }

  return (
    <Layout title="Finalizar Pedido" showBack>
      {!isIdentified ? (
        <div className="p-6 space-y-8 text-black animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Identificação Necessária</h2>
            <p className="text-gray-500 text-sm">Precisamos de seus dados para processar a entrega.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {authStep === 'id' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <input placeholder="Seu Nome" className="w-full p-4 border rounded-2xl bg-white text-black outline-none focus:border-black transition-all" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Telefone (00) 00000-0000" className="w-full p-4 border rounded-2xl bg-white text-black outline-none focus:border-black transition-all" value={tempPhone} onChange={e => setTempPhone(maskPhone(e.target.value))} />
              </div>
              <button onClick={handleIdentificationSubmit} className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg">Continuar</button>
            </div>
          )}

          {authStep === 'selection' && (
            <div className="space-y-4">
              <button onClick={() => setAuthStep('address')} className="w-full flex items-center p-5 border border-gray-100 rounded-2xl gap-4 text-left hover:bg-gray-50 transition-colors shadow-sm">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Bike size={28} /></div>
                <div><p className="font-bold text-lg">Delivery</p><p className="text-sm text-gray-500 font-medium">Receba no seu endereço</p></div>
              </button>
              <button onClick={() => { setAddress({ type: 'pickup', city: 'Local', neighborhood: 'Loja', street: config.address, number: '' } as Address); setError(''); }} className="w-full flex items-center p-5 border border-gray-100 rounded-2xl gap-4 text-left hover:bg-gray-50 transition-colors shadow-sm">
                <div className="bg-gray-100 p-4 rounded-full text-gray-600"><Store size={28} /></div>
                <div><p className="font-bold text-lg">Retirada na loja</p><p className="text-sm text-gray-500 font-medium">Retire no local</p></div>
              </button>
            </div>
          )}

          {authStep === 'address' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <select className="w-full p-4 border rounded-xl bg-white text-black" value={addrForm.city || ''} onChange={(e) => setAddrForm({...addrForm, city: e.target.value})}>
                  <option value="">Selecione sua cidade</option>
                  <option value="Bebedouro">Bebedouro</option>
                  <option value="Sertãozinho">Sertãozinho</option>
                </select>
                <input placeholder="Bairro" className="w-full p-4 border rounded-xl bg-white text-black outline-none focus:border-black transition-all" value={addrForm.neighborhood || ''} onChange={(e) => setAddrForm({...addrForm, neighborhood: e.target.value})} />
                <div className="flex gap-2">
                  <input placeholder="Rua" className="flex-1 p-4 border rounded-xl bg-white text-black outline-none focus:border-black transition-all" value={addrForm.street || ''} onChange={(e) => setAddrForm({...addrForm, street: e.target.value})} />
                  <input placeholder="Nº" className="w-24 p-4 border rounded-xl bg-white text-black outline-none focus:border-black transition-all" value={addrForm.number || ''} onChange={(e) => setAddrForm({...addrForm, number: e.target.value})} />
                </div>
                <input placeholder="Complemento (Opcional)" className="w-full p-4 border rounded-xl bg-white text-black outline-none focus:border-black transition-all" value={addrForm.complement || ''} onChange={(e) => setAddrForm({...addrForm, complement: e.target.value})} />
              </div>
              <button onClick={handleAddressSubmit} className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg">Salvar e Continuar</button>
              <button onClick={() => setAuthStep('selection')} className="w-full py-3 text-gray-400 font-bold">Voltar</button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 space-y-6 text-black animate-fade-in">
          <div ref={errorRef}>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-fade-in">
                <AlertCircle size={20} /> {error}
              </div>
            )}
          </div>
          
          <section className="space-y-3">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Seus dados</h3>
            <input 
              ref={nameInputRef}
              type="text" 
              placeholder="Nome Completo (obrigatório)" 
              className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-white focus:border-black outline-none transition-all" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <input 
              ref={cpfInputRef}
              type="text" 
              placeholder="CPF (obrigatório) Ex: 000.000.000-00" 
              className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-white focus:border-black outline-none transition-all" 
              value={cpf} 
              onChange={handleCpfChange} 
            />
            {user?.address && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <MapPin size={18} className="text-gray-400 mt-0.5" />
                 <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço de Entrega</p><p className="text-[12px] font-bold text-black truncate">{user.address.type === 'pickup' ? 'Retirada no local' : `${user.address.street}, ${user.address.number}`}</p><p className="text-[10px] text-gray-500">{user.address.neighborhood} - {user.address.city}</p></div>
              </div>
            )}
          </section>

          <section className="bg-green-50 p-5 rounded-2xl border border-green-100 animate-fade-in">
            <p className="text-[10px] font-bold text-green-700 uppercase mb-3 tracking-widest">Sugestão do dia</p>
            <button onClick={() => setUpsellSelected(!upsellSelected)} className={`w-full flex items-center justify-between gap-4 text-left p-3.5 rounded-2xl transition-all ${upsellSelected ? 'bg-white ring-2 ring-green-500 shadow-sm scale-[1.02]' : 'bg-green-50/50'}`}>
              <div className="flex items-center gap-4">
                <img src={dailySuggestion?.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="Sugestão" />
                <div>
                  <p className="font-extrabold text-[13px] text-black">{dailySuggestion?.name}</p>
                  <p className="text-[12px] text-green-600 font-bold">+ {formatCurrency(upsellPrice)}</p>
                </div>
              </div>
              {upsellSelected && <div className="bg-green-500 text-white p-1 rounded-full"><CheckCircle2 size={18} /></div>}
            </button>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-500">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setMethod('pix')} className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${method === 'pix' ? 'border-black bg-gray-50 scale-[1.02]' : 'border-gray-100 bg-white'}`}><QrCode size={24} className={method === 'pix' ? 'text-black' : 'text-gray-300'} /><span className={`text-[11px] font-bold ${method === 'pix' ? 'text-black' : 'text-gray-400'}`}>PIX</span></button>
              <button onClick={() => setMethod('card')} className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-black bg-gray-50 scale-[1.02]' : 'border-gray-100 bg-white'}`}><CreditCard size={24} className={method === 'card' ? 'text-black' : 'text-gray-300'} /><span className={`text-[11px] font-bold ${method === 'card' ? 'text-black' : 'text-gray-400'}`}>CARTÃO</span></button>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-3xl space-y-3.5 border border-gray-100">
            <div className="flex justify-between text-[11px] font-medium"><span className="text-gray-400">Subtotal</span><span className="font-bold text-black">{formatCurrency(subtotal)}</span></div>
            {upsellSelected && (<div className="flex justify-between text-[11px] font-medium text-green-600"><span>Sugestão do dia</span><span className="font-bold">+ {formatCurrency(upsellPrice)}</span></div>)}
            <div className="flex justify-between text-[11px] font-medium"><span className="text-gray-400">Entrega</span><span className="font-bold text-green-600">{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}</span></div>
            <div className="flex justify-between text-xl font-extrabold pt-4 border-t border-dashed border-gray-200 text-black"><span>Total</span><span>{formatCurrency(currentTotal)}</span></div>
          </section>

          <div className="pt-2 space-y-4">
             <button onClick={handlePay} className="w-full py-6 bg-green-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3">PAGAR {formatCurrency(currentTotal)}</button>
            <p className="text-[10px] text-gray-400 text-center px-6 leading-tight">Ao clicar no botão acima você declara que leu e está de acordo com os <span className="underline font-bold text-gray-500">Termos, Taxas e Prazos</span>.</p>
          </div>
        </div>
      )}

      <Modal isOpen={isPaymentModalOpen} onClose={() => !isProcessing && setIsPaymentModalOpen(false)} title="Pagamento Asaas" centered>
        <div className="space-y-6 text-center py-4 px-4 text-black h-full flex flex-col justify-center max-w-[340px] mx-auto">
           {isProcessing ? (
             <div className="flex flex-col items-center gap-6 animate-fade-in"><div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div><div><h4 className="text-xl font-bold">Processando Pagamento</h4><p className="text-sm text-gray-400">Verificando transação no Asaas...</p></div></div>
           ) : (
             <div className="space-y-6 animate-fade-in">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-[10px] font-bold border border-red-100">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {method === 'pix' ? (
                  <div className="space-y-5">
                    <div className="bg-gray-50 p-6 rounded-3xl inline-block border shadow-sm">
                      {pixData ? (
                        <img src={`data:image/png;base64,${pixData.encodedImage}`} className="mx-auto w-40 h-40" alt="PIX QR Code" />
                      ) : (
                        <QrCode size={160} className="mx-auto text-black" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-bold text-black">{pixData ? 'QR Code Gerado!' : 'Aguardando Pagamento PIX'}</p>
                      <p className="text-[12px] text-gray-500">Escaneie o QR Code acima para pagar.</p>
                    </div>
                    {pixData && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(pixData.payload); alert('Código PIX copiado!'); }}
                        className="w-full py-2.5 bg-gray-100 text-black rounded-xl font-bold text-[12px] flex items-center justify-center gap-2"
                      >
                        Copiar código PIX <Smartphone size={14}/>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {showAddCard ? (
                        <div className="text-left space-y-4 animate-fade-in px-1">
                            <h4 className="font-bold text-black text-sm">Cadastrar novo cartão</h4>
                            <div className="space-y-3">
                                <input placeholder="Número do Cartão" className="w-full p-3.5 border rounded-xl bg-white text-black text-sm outline-none focus:border-black transition-all" value={cardNumber} onChange={e => setCardNumber(maskCardNumber(e.target.value))} />
                                <input placeholder="Nome no Cartão" className="w-full p-3.5 border rounded-xl bg-white text-black text-sm outline-none focus:border-black transition-all" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} />
                                <div className="flex gap-2">
                                    <input placeholder="Validade (MM/AA)" className="flex-1 p-3.5 border rounded-xl bg-white text-black text-sm outline-none focus:border-black transition-all" value={cardExpiry} onChange={e => setCardExpiry(maskExpiry(e.target.value))} />
                                    <input placeholder="CVV" maxLength={3} className="w-20 p-3.5 border rounded-xl bg-white text-black text-sm outline-none focus:border-black transition-all" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))} />
                                </div>
                                <button onClick={handleSaveCardAndPay} className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm">Salvar Cartão</button>
                                <button onClick={() => { setShowAddCard(false); setError(''); }} className="w-full py-2 text-gray-400 font-bold text-xs">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 px-1">
                            <div className="bg-gray-100 p-8 rounded-3xl flex items-center justify-center text-gray-400"><CreditCard size={60} /></div>
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cartão selecionado</label>
                                {cards.length > 0 ? (
                                    <div className="p-3.5 border-2 border-black rounded-xl flex items-center justify-between bg-white shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-black p-1.5 rounded-lg text-white"><CreditCard size={18}/></div>
                                            <span className="font-bold text-sm">Final **** {cards[cards.length - 1].number.slice(-4)}</span>
                                        </div>
                                        <CheckCircle2 size={18} className="text-green-500" />
                                    </div>
                                ) : (
                                    <button onClick={() => setShowAddCard(true)} className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:border-black hover:text-black transition-all">
                                        <Plus size={16} /> Cadastrar Cartão
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                  </div>
                )}
                {!showAddCard && (
                    <div className="space-y-3 px-1">
                        <button onClick={confirmPaymentReal} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-700 transition-all">Confirmar Pagamento</button>
                        <button onClick={() => setIsPaymentModalOpen(false)} className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar transação</button>
                    </div>
                )}
             </div>
           )}
        </div>
      </Modal>
    </Layout>
  );
};

export default CheckoutPage;
