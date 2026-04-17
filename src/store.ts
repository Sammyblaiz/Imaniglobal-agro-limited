import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CountryRate {
  id: string;
  country: string;
  cargo: number;
  shipping: number;
}

export function getProductUnitDetails(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('charcoal')) return { type: 'bag', kg: 20 };
  if (lower.includes('hibiscus')) return { type: 'bag', kg: 10 };
  if (lower.includes('cashew')) return { type: 'bag', kg: 20 };
  if (lower.includes('cola')) return { type: 'bag', kg: 20 };
  if (lower.includes('shea')) return { type: 'kg', kg: 1 };
  
  // Default fallback if a brand new category is created
  return { type: 'kg', kg: 1 }; 
}

interface AppState {
  products: Product[];
  cart: CartItem[];
  isAdmin: boolean;
  adminToken: string | null;
  isLoading: boolean;
  shippingRates: CountryRate[];
  
  // Actions
  fetchProducts: () => Promise<void>;
  fetchShippingRates: () => Promise<void>;
  addToCart: (product: Product, quantityKg?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Admin Actions
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateShippingRates: (rates: CountryRate[]) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  products: [],
  cart: [],
  isAdmin: !!localStorage.getItem('adminToken'),
  adminToken: localStorage.getItem('adminToken'),
  isLoading: false,
  shippingRates: [],

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        set({ products: data, isLoading: false });
      } else {
        console.error("Failed to fetch products:", data.error || "Unknown error");
        set({ products: [], isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      set({ products: [], isLoading: false });
    }
  },

  fetchShippingRates: async () => {
    try {
      const res = await fetch('/api/shipping-rates');
      if (res.ok) {
        const data = await res.json();
        set({ shippingRates: data });
      }
    } catch (error) {
      console.error("Failed to fetch shipping rates", error);
    }
  },

  addToCart: (product, quantityKg = 1) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      set({
        cart: cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantityKg } : item
        )
      });
    } else {
      set({ cart: [...cart, { ...product, quantity: quantityKg }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    });
  },

  clearCart: () => set({ cart: [] }),

  loginAdmin: (token) => {
    localStorage.setItem('adminToken', token);
    set({ isAdmin: true, adminToken: token });
  },

  logoutAdmin: () => {
    localStorage.removeItem('adminToken');
    set({ isAdmin: false, adminToken: null });
  },

  addProduct: async (product) => {
    const { adminToken, fetchProducts } = get();
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(product)
      });
      await fetchProducts();
    } catch (error) {
      console.error("Failed to add product", error);
    }
  },

  updateProduct: async (id, product) => {
    const { adminToken, fetchProducts } = get();
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(product)
      });
      await fetchProducts();
    } catch (error) {
      console.error("Failed to update product", error);
    }
  },

  deleteProduct: async (id) => {
    const { adminToken, fetchProducts } = get();
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  },

  updateShippingRates: async (rates) => {
    const { adminToken, fetchShippingRates } = get();
    try {
      await fetch('/api/shipping-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(rates)
      });
      await fetchShippingRates();
    } catch (error) {
      console.error("Failed to update shipping rates", error);
    }
  }
}));
