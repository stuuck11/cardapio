
import React, { createContext, useContext, useState, useEffect } from 'react';
// Consolidated imports from 'firebase/firestore' to fix module export errors
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
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
  isSynced: boolean;
  
  formatCurrency: (value: number) => string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  setUser: (user: User) => void;
  setAddress: (address: Address | undefined) => void;
  applyCoupon: (code: string) => boolean;
  createOrder: (paymentMethod: 'pix' | 'card', persist?: boolean) => Order;
  addCard: (card: Omit<CreditCard, 'id'>) => Promise<string>;
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

  const [allCampaignIds, setAllCampaignIds] = useState<string[]>(['1']);
  const [config, setConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('japan_box_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Persistence for user locally
  useEffect(() => {
    localStorage.setItem('japan_box_user', JSON.stringify(user));
    localStorage.setItem('japan_box_active_id', activeCampaignId);
  }, [user, activeCampaignId]);

  // Real-time Listeners
  useEffect(() => {
    // 1. Listen to campaigns list
    const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.id);
      if (ids.length > 0) setAllCampaignIds(ids);
      setIsSynced(!snapshot.metadata.fromCache);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsSynced(false);
    });

    // 2. Listen to active campaign config
    const unsubConfig = onSnapshot(doc(db, 'campaigns', activeCampaignId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().config) {
        setConfig(docSnap.data().config as StoreConfig);
      } else {
        // Initialize if not exists
        addCampaign(activeCampaignId);
      }
    });

    // 3. Listen to categories
    const qCats = query(collection(db, `campaigns/${activeCampaignId}/categories`), orderBy('order', 'asc'));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
    });

    // 4. Listen to products
    const unsubProds = onSnapshot(collection(db, `campaigns/${activeCampaignId}/products`), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    });

    // 5. Listen to orders
    const qOrders = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
    });

    // 6. Listen to cards
    const unsubCards = onSnapshot(collection(db, 'cards'), (snapshot) => {
      setCards(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CreditCard)));
    });

    return () => {
      unsubCampaigns();
      unsubConfig();
      unsubCats();
      unsubProds();
      unsubOrders();
      unsubCards();
    };
  }, [activeCampaignId]);

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
  const setAddress = (addr: Address | undefined) => {
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
      // Use setDoc instead of addDoc to respect the manually generated order ID
      setDoc(doc(db, 'orders', newOrder.id), newOrder);
      clearCart();
    }
    return newOrder;
  };

  const addCard = async (card: Omit<CreditCard, 'id'>) => {
    const docRef = await addDoc(collection(db, 'cards'), card);
    return docRef.id;
  };
  
  const removeCard = async (id: string) => {
    await deleteDoc(doc(db, 'cards', id));
  };

  const updateCampaignData = async (id: string, data: Partial<CampaignData>) => {
    if (data.config) {
      await setDoc(doc(db, 'campaigns', id), { config: data.config }, { merge: true });
    }
    
    if (data.categories) {
      for (const cat of data.categories) {
        await setDoc(doc(db, `campaigns/${id}/categories`, cat.id), cat);
      }
    }

    if (data.products) {
      for (const prod of data.products) {
        await setDoc(doc(db, `campaigns/${id}/products`, prod.id), prod);
      }
    }
  };

  const setActiveCampaign = (id: string) => {
    setActiveCampaignId(id);
  };

  const addCampaign = async (id: string) => {
    const docRef = doc(db, 'campaigns', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { config: INITIAL_STORE_CONFIG });
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, `campaigns/${id}/categories`, cat.id), cat);
      }
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, `campaigns/${id}/products`, prod.id), prod);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      activeCampaignId, config, categories, products, coupons: INITIAL_COUPONS, cart, user, orders, cards, activeCoupon,
      allCampaignIds, isSynced,
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
