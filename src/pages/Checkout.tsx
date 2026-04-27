import React, { useState } from 'react';
import { useStore, getProductUnitDetails } from '../store';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, shippingRates, selectedCountryId, shippingType } = useStore();
  
  const [billingInfo, setBillingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: ''
  });
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', address: '', city: '', postalCode: ''
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  if (cart.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
        <h2 className="font-bold text-2xl mb-4">Your cart is empty</h2>
        <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const activeRate = shippingRates.find(r => r.id === selectedCountryId);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalKg = cart.reduce((acc, item) => {
    const unitInfo = getProductUnitDetails(item.name);
    return acc + (item.quantity * unitInfo.kg);
  }, 0);
  const rawShippingCost = activeRate ? (shippingType === 'cargo' ? activeRate.cargo : activeRate.shipping) : 0;
  const shippingCost = (rawShippingCost / 20) * totalKg; 
  const total = (subtotal + shippingCost).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build WhatsApp Message
    const orderDetails = cart.map(item => {
      const unit = getProductUnitDetails(item.name);
      const unitDesc = unit.type === 'bag' ? 'bag(s)' : 'kg';
      return `${item.quantity} ${unitDesc} of ${item.name}`;
    }).join(', ');
    const displayCountry = activeRate?.country || 'Unknown';

    const billInfoStr = `${billingInfo.firstName} ${billingInfo.lastName}, ${billingInfo.email}, ${billingInfo.phone}`;
    const shipDest = sameAsBilling ? 'Same as billing' : `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city}`;

    const message = `Hello IMANIGLOBAL! I would like to make a payment for my order of $${total}.
    
*Order Items:* ${orderDetails}
*Destination Country:* ${displayCountry}
*Shipping Method:* ${shippingType}

*Billing Details:*
${billInfoStr}

*Shipping Destination:*
${shipDest}

Please provide me with the payment instructions!`;

    const whatsappUrl = `https://wa.me/447379352882?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 500);
  };

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({...billingInfo, [e.target.name]: e.target.value});
  };

  const handleShipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({...shippingInfo, [e.target.name]: e.target.value});
  };

  return (
    <div className="bg-bg min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-8 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          
          <h1 className="font-display text-4xl font-bold mb-8 text-black">Checkout</h1>
          <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-10">
            {/* Billing Details */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Billing Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">First Name</label>
                  <input required name="firstName" value={billingInfo.firstName} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Last Name</label>
                  <input required name="lastName" value={billingInfo.lastName} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input required type="email" name="email" value={billingInfo.email} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input required type="tel" name="phone" value={billingInfo.phone} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Address</label>
                  <input required name="address" value={billingInfo.address} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">City</label>
                  <input required name="city" value={billingInfo.city} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Postal Code</label>
                  <input required name="postalCode" value={billingInfo.postalCode} onChange={handleBillChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Shipping Address</h2>
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer font-semibold max-w-max">
                  <input 
                    type="checkbox" 
                    checked={sameAsBilling} 
                    onChange={() => setSameAsBilling(!sameAsBilling)}
                    className="w-4 h-4 text-primary"
                  />
                  Same as billing address
                </label>
              </div>

              {!sameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name</label>
                    <input required name="firstName" value={shippingInfo.firstName} onChange={handleShipChange} className="w-full border border-gray-300 rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name</label>
                    <input required name="lastName" value={shippingInfo.lastName} onChange={handleShipChange} className="w-full border border-gray-300 rounded-lg p-3" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Address</label>
                    <input required name="address" value={shippingInfo.address} onChange={handleShipChange} className="w-full border border-gray-300 rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <input required name="city" value={shippingInfo.city} onChange={handleShipChange} className="w-full border border-gray-300 rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Postal Code</label>
                    <input required name="postalCode" value={shippingInfo.postalCode} onChange={handleShipChange} className="w-full border border-gray-300 rounded-lg p-3" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider border-b pb-4">Your Order</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{item.name} x {item.quantity} {getProductUnitDetails(item.name).type}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-4 border-y border-gray-100 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping ({activeRate?.country})</span>
                <span className="font-semibold text-black">${shippingCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-primary">${total}</span>
            </div>

            <button 
              type="submit"
              form="checkoutForm"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-full font-bold shadow-md hover:bg-green-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 uppercase tracking-wider"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Order on WhatsApp
            </button>
            <p className="text-xs text-text-muted text-center mt-4">
              Your order details will be sent directly to our secure WhatsApp line for final processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
