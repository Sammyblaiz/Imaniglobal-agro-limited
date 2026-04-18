import { create } from 'zustand';

import { supabase } from './lib/supabase';

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
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      // Use Supabase data directly. If it's empty ([]), we want to show an empty store.
      set({ products: data || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch products from Supabase", error);
      // Ensure we don't load dummy data anymore
      set({ products: [], isLoading: false });
    }
  },

  fetchShippingRates: async () => {
    try {
      const res = await fetch('/api/shipping-rates').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        set({ shippingRates: data });
        localStorage.setItem('shippingRatesBackup', JSON.stringify(data));
      } else {
        const backup = localStorage.getItem('shippingRatesBackup');
        if (backup) set({ shippingRates: JSON.parse(backup) });
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
    const { fetchProducts } = get();
    try {
      const { error } = await supabase.from('products').insert([product]);
      if (error) throw error;
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to add product", error);
      alert(`Error adding product: ${error?.message || 'Unknown error'}. Please ensure the 'products' table exists and RLS is disabled.`);
    }
  },

  updateProduct: async (id, product) => {
    const { fetchProducts } = get();
    try {
      const { error } = await supabase.from('products').update(product).eq('id', id);
      if (error) throw error;
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to update product", error);
      alert(`Error updating product: ${error?.message || 'Unknown error'}. Please ensure the 'products' table exists and RLS is disabled.`);
    }
  },

  deleteProduct: async (id) => {
    const { fetchProducts } = get();
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to delete product", error);
      alert(`Error deleting product: ${error?.message || 'Unknown error'}. Please ensure the 'products' table exists and RLS is disabled.`);
    }
  },

  updateShippingRates: async (rates) => {
    const { adminToken, fetchShippingRates } = get();
    try {
      set({ shippingRates: rates });
      localStorage.setItem('shippingRatesBackup', JSON.stringify(rates));
      await fetch('/api/shipping-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(rates)
      }).catch(() => null);
    } catch (error) {
      console.error("Failed to update shipping rates", error);
    }
  }
}));
