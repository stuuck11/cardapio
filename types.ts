
export interface StoreConfig {
  name: string;
  address: string;
  openingHours: string; // Formato: "17:00 às 23:00"
  isOpen: boolean; 
  deliveryFee: number;
  minOrder: number;
  primaryColor: string;
  bannerUrl: string;
  logoUrl: string;
  gateway: 'asaas' | 'mercado_pago' | 'manual';
  dailySuggestionId?: string; // ID do produto sugerido do dia
  metaPixelId?: string; // ID do Pixel da Meta
  metaCapiToken?: string; // Token de Acesso CAPI
}

export interface CreditCard {
  id: string;
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  options?: ProductOption[];
}

export interface ProductOption {
  id: string;
  title: string;
  subtitle: string;
  minSelection: number;
  maxSelection: number;
  items: OptionItem[];
}

export interface OptionItem {
  id: string;
  name: string;
  price: number;
  description?: string; // Legenda/descrição do item (ex: "Lata 350ml")
  iconUrl?: string; // Link para o ícone do adicional
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface CartItem {
  id: string; // ID único da instância no carrinho
  productId: string;
  name: string;
  basePrice: number;
  totalPrice: number;
  quantity: number;
  observation?: string;
  selectedOptions: {
    optionId: string;
    items: OptionItem[];
  }[];
}

export interface User {
  name: string;
  phone: string;
  address?: Address;
}

export interface Address {
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  zipCode: string;
  type: 'delivery' | 'pickup';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'pix' | 'card';
  date: string;
  address?: Address;
  isPaid?: boolean; // Campo para identificar pedidos pagos
}

export interface Coupon {
  code: string;
  discountPercentage: number;
}
