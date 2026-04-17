import React, { useState, useEffect, useRef } from 'react';
import { useStore, getProductUnitDetails } from '../store';
import { Trash2, Plus, Minus, ArrowRight, CheckCircle, Plane, Ship, Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, shippingRates, fetchShippingRates } = useStore();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shippingType, setShippingType] = useState<'cargo' | 'shipping'>('cargo');
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchShippingRates();
  }, [fetchShippingRates]);

  useEffect(() => {
    if (shippingRates.length > 0 && !selectedCountryId) {
      setSelectedCountryId(shippingRates[0].id);
    }
  }, [shippingRates, selectedCountryId]);

  const activeRate = shippingRates.find(r => r.id === selectedCountryId) || shippingRates[0];
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalKg = cart.reduce((acc, item) => {
    const unitInfo = getProductUnitDetails(item.name);
    return acc + (item.quantity * unitInfo.kg);
  }, 0);
  const rawShippingCost = activeRate ? (shippingType === 'cargo' ? activeRate.cargo : activeRate.shipping) : 0;
  
  // Rate is defined for 20kg. Cost = (Rate / 20) * total_kg
  const shippingCost = (rawShippingCost / 20) * totalKg; 
  const total = (subtotal + shippingCost).toFixed(2);

  const filteredCountries = shippingRates.filter(r => r.country.toLowerCase().includes(countrySearch.toLowerCase()));

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: checkoutForm.email || 'customer@imaniglobal.com',
    amount: Math.round(parseFloat(total) * 100), 
    publicKey: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample',
  };

  const initializePayment = usePaystackPayment(paystackConfig as any);

  const onSuccess = async (reference: any) => {
    const orderDetails = cart.map(item => {
      const unit = getProductUnitDetails(item.name);
      const unitDesc = unit.type === 'bag' ? 'bag(s)' : 'kg';
      return `${item.quantity} ${unitDesc} of ${item.name}`;
    }).join(', ');
    const displayCountry = activeRate?.country || 'Unknown';

    try {
      await fetch("https://formsubmit.co/ajax/samuelirem6@gmail.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: checkoutForm.name,
          email: checkoutForm.email,
          order_items: orderDetails,
          total_paid: `€${total} (Ref: ${reference?.reference})`,
          _subject: `New Paid Order from ${checkoutForm.name}`,
          _autoresponse: `Thank you for your payment of €${total} to IMANIGLOBAL! Your order for the following items has been successfully confirmed: ${orderDetails}. We will reach out shortly regarding shipping details for ${displayCountry}.`
        })
      });

      clearCart();
      setIsProcessing(false);
      
      const message = `Hello IMANIGLOBAL! I just made a payment of €${total} for my order (Ref: ${reference?.reference}). My email is ${checkoutForm.email}.\n\nOrder items: ${orderDetails}.\nDestination Country: ${displayCountry}\n\nPlease confirm my shipping details.`;
      const whatsappUrl = `https://wa.me/2349127485007?text=${encodeURIComponent(message)}`;
      
      // Navigate in current window to ensure mobile works perfectly without popup blocks
      window.location.href = whatsappUrl;
    } catch (err) {
      console.error("Payment error", err);
      // Fallback
      clearCart();
      setIsProcessing(false);
      const message = `Hello IMANIGLOBAL! I just made a payment of €${total} for my order (Ref: ${reference?.reference}). My email is ${checkoutForm.email}.\n\nOrder items: ${orderDetails}.\nDestination Country: ${displayCountry}\n\nPlease confirm my shipping details.`;
      const whatsappUrl = `https://wa.me/2349127485007?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
    }
  };

  const onClose = () => {
    setIsProcessing(false);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.email) {
      alert("Please enter both Name and Email to proceed.");
      return;
    }
    
    setIsProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="font-display text-3xl font-bold mb-4 text-black">Your Cart is Empty</h2>
        <p className="text-text-muted mb-8 text-center">Looks like you haven't added any commodities to your cart yet.</p>
        <Link to="/shop" className="px-8 py-4 bg-primary text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          Browse Commodities
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl font-bold mb-8 text-black">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div 
                  className="w-24 h-24 bg-gray-100 rounded bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-black uppercase text-sm mb-1">{item.name}</h3>
                  <p className="text-primary font-semibold">€{item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded">
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50 text-black"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-20 text-center font-medium text-sm">
                      {item.quantity} {getProductUnitDetails(item.name).type === 'bag' ? 'bag(s)' : 'kg'}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-lg mb-6 text-black uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                {isCheckout && (
                  <div className="space-y-3 py-4 border-y border-gray-100">
                    <h4 className="font-bold text-black uppercase text-xs tracking-wider">Destination Country</h4>
                    <div className="relative">
                      <div 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setIsDropdownOpen(!isDropdownOpen);
                          setCountrySearch(''); // Reset search when opening/closing
                        }}
                      >
                        <span className="truncate">{activeRate?.country || "Select destination..."}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 flex flex-col overflow-hidden">
                          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Search country alphabetically..."
                              className="w-full bg-transparent border-none focus:outline-none text-sm"
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map(rate => (
                                <div 
                                  key={rate.id}
                                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedCountryId === rate.id ? 'bg-black text-white hover:bg-black/90' : 'text-gray-800'}`}
                                  onClick={() => {
                                    setSelectedCountryId(rate.id);
                                    setIsDropdownOpen(false);
                                    setCountrySearch('');
                                  }}
                                >
                                  {rate.country}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">No country found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-black uppercase text-xs tracking-wider mt-4">Select Method (Based on {totalKg} kg)</h4>
                    <div className="text-xs text-text-muted mb-2 font-medium">Fixed base rates apply per 20kg.</div>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" value="cargo" checked={shippingType === 'cargo'} onChange={() => setShippingType('cargo')} className="text-primary focus:ring-primary h-4 w-4" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-text-muted group-hover:text-black transition-colors" />
                            <span className="text-black font-medium">Cargo Delivery</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 ml-6">Takes up to 5 working days</p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">€{activeRate ? ((activeRate.cargo / 20) * totalKg).toFixed(2) : '0.00'}</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group mt-2">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" value="shipping" checked={shippingType === 'shipping'} onChange={() => setShippingType('shipping')} className="text-primary focus:ring-primary h-4 w-4" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Ship className="w-4 h-4 text-text-muted group-hover:text-black transition-colors" />
                            <span className="text-black font-medium">Standard Shipping</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 ml-6">Takes up to 21 working days</p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">€{activeRate ? ((activeRate.shipping / 20) * totalKg).toFixed(2) : '0.00'}</span>
                    </label>
                  </div>
                )}

                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span>{isCheckout ? `€${shippingCost.toFixed(2)}` : 'Calculated at checkout'}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-black">
                  <span>Total</span>
                  <span>{isCheckout ? `€${total}` : `€${subtotal.toFixed(2)}`}</span>
                </div>
              </div>
              
              {!isCheckout ? (
                <>
                  <button 
                    onClick={() => setIsCheckout(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-full font-semibold text-sm hover:bg-primary shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-text-muted mt-4 text-center">
                    You will be redirected to secure payment, and then to WhatsApp to finalize shipping details.
                  </p>
                </>
              ) : (
                <form onSubmit={handlePayment} className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-sm uppercase text-black">Contact Details</h4>
                  </div>
                  <input required type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm" value={checkoutForm.name} onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})} />
                  <input required type="email" placeholder="Email Address (for receipt)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm" value={checkoutForm.email} onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})} />
                  <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-full font-semibold text-sm hover:bg-green-700 shadow-md transition-all duration-300 disabled:opacity-70 mt-2"
                  >
                    {isProcessing ? 'Connecting to Paystack...' : `Pay Securely via Paystack (€${total})`}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCheckout(false)} 
                    disabled={isProcessing}
                    className="w-full text-center text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-black mt-4 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
