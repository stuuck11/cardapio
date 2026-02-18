
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreConfig, Product, Category, CartItem, User, Order, Coupon, Address, CreditCard } from '../types';
import { INITIAL_STORE_CONFIG, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from '../constants';

interface CampaignData {
  config: StoreConfig;
  categories: Category[];
  products: Product[];
}

interface AppContextType {
  activeCampaignId: string;
  config: StoreConfig;
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  cards: CreditCard[];
  activeCoupon: Coupon | null;
  allCampaignIds: string[];
  
  formatCurrency: (value: number) => string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  setUser: (user: User) => void;
  setAddress: (address: Address) => void;
  applyCoupon: (code: string) => boolean;
  createOrder: (paymentMethod: 'pix' | 'card', persist?: boolean) => Order;
  addCard: (card: Omit<CreditCard, 'id'>) => void;
  removeCard: (id: string) => void;
  
  setActiveCampaign: (id: string) => void;
  addCampaign: (id: string) => void;
  updateCampaignData: (id: string, data: Partial<CampaignData>) => void;
  isStoreOpen: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCampaignId, setActiveCampaignId] = useState(() => {
    return localStorage.getItem('japan_box_active_id') || '1';
  });
  
  const [allCampaigns, setAllCampaigns] = useState<Record<string, CampaignData>>(() => {
    const saved = localStorage.getItem('japan_box_all_campaigns');
    if (saved) return JSON.parse(saved);
    return {
      '1': { config: INITIAL_STORE_CONFIG, categories: INITIAL_CATEGORIES, products: INITIAL_PRODUCTS }
    };
  });

  useEffect(() => {
    localStorage.setItem('japan_box_all_campaigns', JSON.stringify(allCampaigns));
    localStorage.setItem('japan_box_active_id', activeCampaignId);
  }, [allCampaigns, activeCampaignId]);

  const campaign = allCampaigns[activeCampaignId] || allCampaigns['1'];
  const { config, categories, products } = campaign;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('japan_box_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('japan_box_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('japan_box_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    localStorage.setItem('japan_box_user', JSON.stringify(user));
    localStorage.setItem('japan_box_orders', JSON.stringify(orders));
    localStorage.setItem('japan_box_cards', JSON.stringify(cards));
  }, [user, orders, cards]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const isStoreOpen = () => {
    try {
      const hours = config.openingHours.toLowerCase();
      const parts = hours.split(' às ');
      if (parts.length !== 2) return false;
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const parseTime = (t: string) => {
        const [h, m] = t.trim().split(':').map(Number);
        return h * 60 + m;
      };
      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);
      if (start > end) return currentTime >= start || currentTime <= end;
      return currentTime >= start && currentTime <= end;
    } catch (e) {
      return false;
    }
  };

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCart([]); setActiveCoupon(null); };
  const setUser = (u: User) => setUserState(u);
  const setAddress = (addr: Address) => {
    if (user) setUserState({ ...user, address: addr });
    else setUserState({ name: '', phone: '', address: addr });
  };
  const applyCoupon = (code: string) => {
    const found = INITIAL_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setActiveCoupon(found);
      return true;
    }
    return false;
  };

  const createOrder = (paymentMethod: 'pix' | 'card', persist: boolean = false): Order => {
    const subtotal = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
    const fee = user?.address?.type === 'delivery' ? config.deliveryFee : 0;
    const discountAmount = activeCoupon ? (subtotal * (activeCoupon.discountPercentage / 100)) : 0;
    const total = subtotal + fee - discountAmount;
    const newOrder: Order = {
      id: `${Math.floor(300000 + Math.random() * 90000)}`,
      userId: user?.phone || 'anonymous',
      items: [...cart],
      subtotal,
      deliveryFee: fee,
      total,
      status: 'pending',
      paymentMethod,
      date: new Date().toISOString(),
      address: user?.address,
    };
    if (persist) {
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
    }
    return newOrder;
  };

  const addCard = (card: Omit<CreditCard, 'id'>) => {
    setCards(prev => [...prev, { ...card, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const removeCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id));

  const updateCampaignData = (id: string, data: Partial<CampaignData>) => {
    setAllCampaigns(prev => ({
      ...prev,
      [id]: { ...(prev[id] || prev['1']), ...data }
    }));
  };

  const setActiveCampaign = (id: string) => {
    setActiveCampaignId(id);
  };

  const addCampaign = (id: string) => {
    if (!allCampaigns[id]) {
      setAllCampaigns(prev => ({
        ...prev,
        [id]: { config: INITIAL_STORE_CONFIG, categories: INITIAL_CATEGORIES, products: INITIAL_PRODUCTS }
      }));
    }
  };

  return (
    <AppContext.Provider value={{
      activeCampaignId, config, categories, products, coupons: INITIAL_COUPONS, cart, user, orders, cards, activeCoupon,
      allCampaignIds: Object.keys(allCampaigns),
      formatCurrency, addToCart, removeFromCart, clearCart, setUser, setAddress, applyCoupon, createOrder, addCard, removeCard,
      setActiveCampaign, addCampaign, updateCampaignData, isStoreOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
