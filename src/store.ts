import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  // Ensure all products except Shea butter are 10kg per bag
  if (lower.includes('shea')) return { type: 'kg', kg: 1 };
  
  // Default fallback for everything else
  return { type: 'bag', kg: 10 }; 
}

interface AppState {
  products: Product[];
  cart: CartItem[];
  isAdmin: boolean;
  adminToken: string | null;
  isLoading: boolean;
  shippingRates: CountryRate[];
  selectedCountryId: string | null;
  shippingType: 'cargo' | 'shipping';
  
  // Actions
  fetchProducts: () => Promise<void>;
  fetchShippingRates: () => Promise<void>;
  setCheckoutCountry: (id: string) => void;
  setShippingType: (type: 'cargo' | 'shipping') => void;
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

const defaultCountryNames = [ "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

const defaultShippingRates = defaultCountryNames.map((country, idx) => ({
  id: String(idx + 1),
  country: country,
  cargo: 150,
  shipping: 50
}));

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      isAdmin: !!localStorage.getItem('adminToken'),
      adminToken: localStorage.getItem('adminToken'),
      isLoading: false,
      shippingRates: [],
      selectedCountryId: null,
      shippingType: 'cargo',

      setCheckoutCountry: (id) => set({ selectedCountryId: id }),
      setShippingType: (type) => set({ shippingType: type }),

      fetchProducts: async () => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.from('products').select('*');
          if (error) {
            console.error("Supabase fetch error:", error);
            throw error;
          }
          if (data) {
            set({ products: data, isLoading: false });
          } else {
            set({ products: [], isLoading: false });
          }
        } catch (error) {
          console.error("Failed to fetch products", error);
          set({ products: [], isLoading: false });
        }
      },

  fetchShippingRates: async () => {
    const backup = localStorage.getItem('shippingRatesBackup');
    if (backup) {
      set({ shippingRates: JSON.parse(backup) });
    } else {
      set({ shippingRates: defaultShippingRates });
      localStorage.setItem('shippingRatesBackup', JSON.stringify(defaultShippingRates));
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
      const newProduct = { ...product, id: crypto.randomUUID() };
      
      try {
        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) {
          console.error("Supabase insert error:", error);
        }
      } catch (err) {
        // Ignore supabase insert failure
      }

      const cached = JSON.parse(localStorage.getItem('imaniglobal_products') || '[]');
      const newProductNoImage = { ...newProduct };
      delete newProductNoImage.image;
      localStorage.setItem('imaniglobal_products', JSON.stringify([...cached, newProductNoImage]));
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to add product to local storage, possible quota exceeded", error);
      alert("Error adding product. Image size might be too large.");
    }
  },

  updateProduct: async (id, product) => {
    const { fetchProducts } = get();
    try {
      try {
        const { error } = await supabase.from('products').update(product).eq('id', id);
        if (error) {
          console.error("Supabase update error:", error);
        }
      } catch (err) {
        // Ignore supabase update failure
      }

      const cached = JSON.parse(localStorage.getItem('imaniglobal_products') || '[]');
      const productNoImage = { ...product };
      delete productNoImage.image;
      const updated = cached.map((p: any) => p.id === id ? { ...p, ...productNoImage } : p);
      localStorage.setItem('imaniglobal_products', JSON.stringify(updated));
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to update product in local storage, possible quota exceeded", error);
      alert("Error updating product. Image size might be too large.");
    }
  },

  deleteProduct: async (id) => {
    const { fetchProducts } = get();
    try {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error("Supabase delete error:", error);
        }
      } catch (err) {
        // Ignore supabase delete failure
      }

      const cached = JSON.parse(localStorage.getItem('imaniglobal_products') || '[]');
      const filtered = cached.filter((p: any) => p.id !== id);
      localStorage.setItem('imaniglobal_products', JSON.stringify(filtered));
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to delete product from local storage", error);
    }
  },

  updateShippingRates: async (rates) => {
    set({ shippingRates: rates });
    localStorage.setItem('shippingRatesBackup', JSON.stringify(rates));
  }
}),
{
  name: 'imaniglobal-storage-v2',
  partialize: (state) => ({ 
    cart: state.cart.map(item => {
      const copy = { ...item };
      delete copy.image;
      delete copy.description;
      return copy;
    }), 
    selectedCountryId: state.selectedCountryId, 
    shippingType: state.shippingType 
  })
}
));
