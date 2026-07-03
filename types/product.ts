export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  originalPrice?: number;
  composition?: string[];
  inStock?: boolean;
  isPopular?: boolean;
  is_popular?: boolean;
  popularity_score?: number;
  tags?: string[];
  details?: string;
  featured_slot?: number | null;
  created_at?: string;
}

export interface CartAddons {
  balloons: number;
  toys: number;
  vases: number;
}

export interface CartItemExtras {
  postcardWanted: boolean;
  postcardText: string;
  addons: CartAddons;
}

export interface CartItem extends Product {
  cartKey: string;
  quantity: number;
  postcardWanted: boolean;
  postcardText: string;
  addons: CartAddons;
}

export interface OrderPostcard {
  wanted: boolean;
  text: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  orderPostcard: OrderPostcard | null;
}
