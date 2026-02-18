
import { Category, Product, StoreConfig } from './types';

// Fixed missing 'gateway' property to satisfy StoreConfig interface
export const INITIAL_STORE_CONFIG: StoreConfig = {
  name: "Japan Box Express",
  address: "Avenida Prefeito Edne José Piffer, 511",
  openingHours: "17:00 às 23:00",
  isOpen: false, // Defaulting to closed as per screenshot example
  deliveryFee: 5.00,
  minOrder: 30.00,
  primaryColor: "#E31B23",
  bannerUrl: "https://static.saipos.com/site_delivery/cover15.png",
  logoUrl: "https://imgur.com/qfIhJeT.png",
  gateway: 'asaas',
  metaCapiToken: "",
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'SÓ HOJE ( MEGA PROMOÇÃO)', order: 1 },
  { id: 'cat2', name: 'Promo do Dia!', order: 2 },
  { id: 'cat3', name: 'Combinados', order: 3 },
  { id: 'cat4', name: 'Temakis', order: 4 },
  { id: 'cat5', name: 'Bebidas', order: 5 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    categoryId: 'cat1',
    name: 'COMBO ROLL',
    description: 'Delicioso combo de rolls variados com salmão e cream cheese.',
    price: 47.99,
    imageUrl: 'https://picsum.photos/seed/sushi_roll/400/300',
  },
  {
    id: 'p2',
    categoryId: 'cat2',
    name: 'COMBO CARNAVAL 1',
    description: '2 Temaki Cru 120G 5 Joy Salmão...',
    price: 59.90,
    imageUrl: 'https://picsum.photos/seed/combo_carnaval/400/300',
  },
  {
    id: 'p3',
    categoryId: 'cat3',
    name: 'Combinado Premium 20 Peças',
    description: 'A seleção do chef com os melhores cortes do dia.',
    price: 89.00,
    imageUrl: 'https://picsum.photos/seed/premium_sushi/400/300',
  }
];

export const INITIAL_COUPONS = [
  { code: 'BEMVINDO', discountPercentage: 10 },
];