
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { CheckCircle, Clock, MapPin, User, Receipt, CreditCard, Smartphone, ShoppingBag, XCircle } from 'lucide-react';
import { Order } from '../types';
import { Modal } from '../components/Modals';

const OrdersPage: React.FC = () => {
  const { orders, formatCurrency } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getArrivalWindow = (dateStr: string) => {
    const start = new Date(dateStr);
    const end = new Date(dateStr);
    start.setMinutes(start.getMinutes() + 60);
    end.setMinutes(end.getMinutes() + 90);
    const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <>
      <Layout title="Histórico de Pedidos">
        <div className="p-4 space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{formatDate(order.date)}</p>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full p-5 bg-white border border-gray-100 rounded-3xl text-left hover:border-black transition-all shadow-sm flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-2xl text-black">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-base text-black">Pedido #{order.id}</p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {order.address?.type === 'pickup' ? 'Retirada' : 'Entrega'} • {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className={`${order.paymentMethod === 'card' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} p-1.5 rounded-full`}>
                       {order.paymentMethod === 'card' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </div>
                  </div>
                  
                  <div className="border-t border-dashed border-gray-100 pt-4 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 text-wrap">
                      <div className={`w-2 h-2 ${order.paymentMethod === 'card' ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`} />
                      <span className={`text-[10px] font-bold ${order.paymentMethod === 'card' ? 'text-red-600' : 'text-green-600'} uppercase tracking-tight`}>
                          {order.paymentMethod === 'card' ? 'Pagamento recusado pelo banco emissor' : 'Pedido em processamento'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold">
                      {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      </Layout>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Detalhes do Pedido">
        {selectedOrder && (
          <div className="space-y-8 pb-20 p-5 text-black animate-fade-in w-full h-auto overflow-y-auto bg-white">
            <div className={`${selectedOrder.paymentMethod === 'card' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} p-6 rounded-3xl flex items-center justify-between border shadow-sm`}>
              <div className="space-y-1.5 flex-1">
                <p className={`text-[10px] font-bold ${selectedOrder.paymentMethod === 'card' ? 'text-red-700' : 'text-green-700'} uppercase tracking-widest`}>
                    {selectedOrder.paymentMethod === 'card' ? 'STATUS DO PAGAMENTO' : 'Previsão para Entrega'}
                </p>
                <p className={`text-lg font-extrabold leading-tight ${selectedOrder.paymentMethod === 'card' ? 'text-red-900' : 'text-green-900'}`}>
                    {selectedOrder.paymentMethod === 'card' ? 'Pagamento cancelado pelo banco emissor do cartão' : getArrivalWindow(selectedOrder.date)}
                </p>
              </div>
              <div className={`shrink-0 w-12 h-12 ml-4 ${selectedOrder.paymentMethod === 'card' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-2xl flex items-center justify-center shadow-sm`}>
                {selectedOrder.paymentMethod === 'card' ? <XCircle size={24} /> : <Clock size={24} />}
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className={`w-3 h-3 ${selectedOrder.paymentMethod === 'card' ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`} />
                <p className={`font-bold ${selectedOrder.paymentMethod === 'card' ? 'text-red-600' : 'text-green-600'} text-base uppercase tracking-tight`}>
                    {selectedOrder.paymentMethod === 'card' ? 'Pagamento recusado pelo banco emissor' : 'Seu pedido está sendo preparado'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                 <h4 className="font-bold text-base flex items-center gap-3 text-black uppercase tracking-tight">
                    <Receipt size={20} className="text-gray-400" /> Itens do Pedido #{selectedOrder.id}
                 </h4>
                 <div className="space-y-4">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-gray-600 font-medium leading-tight flex-1">
                           <span className="font-extrabold text-black">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-extrabold text-black shrink-0">{formatCurrency(item.totalPrice * item.quantity)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-dashed border-gray-100 pt-6 mt-4 space-y-2.5">
                       <div className="flex justify-between text-xs font-medium text-gray-400">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                       </div>
                       <div className="flex justify-between text-xs font-medium text-green-600">
                          <span>Taxa de Entrega</span>
                          <span>{selectedOrder.deliveryFee > 0 ? formatCurrency(selectedOrder.deliveryFee) : 'Grátis'}</span>
                       </div>
                       <div className="flex justify-between text-lg font-extrabold text-black pt-2">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            <section className="space-y-6 border-t border-gray-100 pt-8 px-1">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-400">Informações para Entrega</h4>
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><User size={20} /></div>
                <div className="min-w-0">
                   <p className="font-bold text-base text-black">Dados do Cliente</p>
                   <p className="text-sm text-gray-500 font-medium">Japan Box Express Customer</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><MapPin size={20} /></div>
                <div className="min-w-0">
                   <p className="font-bold text-base text-black">Endereço de Entrega</p>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">
                     {selectedOrder.address?.street}, {selectedOrder.address?.number}
                     <br />
                     {selectedOrder.address?.neighborhood}, {selectedOrder.address?.city}
                   </p>
                </div>
              </div>
            </section>

            <section className="space-y-6 border-t border-gray-100 pt-8 pb-10 px-1">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-400">Pagamento</h4>
              <div className={`flex items-center gap-4 ${selectedOrder.paymentMethod === 'card' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm`}>
                {selectedOrder.paymentMethod === 'pix' ? 
                  <div className="bg-black text-white p-3.5 rounded-2xl shrink-0"><Smartphone size={24} /></div> : 
                  <div className="bg-black text-white p-3.5 rounded-2xl shrink-0"><CreditCard size={24} /></div>
                }
                <div className="min-w-0 flex-1">
                   <p className={`font-bold text-base uppercase tracking-tight ${selectedOrder.paymentMethod === 'card' ? 'text-red-700' : 'text-black'}`}>{selectedOrder.paymentMethod}</p>
                   <p className="text-[11px] text-gray-500 font-bold leading-tight">
                       {selectedOrder.paymentMethod === 'card' ? 'Cancelado pelo banco emissor' : `Total: ${formatCurrency(selectedOrder.total)}`}
                   </p>
                </div>
                <div className={`ml-auto shrink-0 ${selectedOrder.paymentMethod === 'card' ? 'bg-red-600' : 'bg-green-500'} text-white p-1.5 rounded-full shadow-sm`}>
                    {selectedOrder.paymentMethod === 'card' ? <XCircle size={16}/> : <CheckCircle size={16}/>}
                </div>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
