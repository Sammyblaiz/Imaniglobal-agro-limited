import React, { useState } from 'react';
import { useStore, getProductUnitDetails } from '../store';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
  const [isFormValid, setIsFormValid] = useState(false);

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

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({...billingInfo, [e.target.name]: e.target.value});
    validateForm({...billingInfo, [e.target.name]: e.target.value}, shippingInfo, sameAsBilling);
  };

  const handleShipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({...shippingInfo, [e.target.name]: e.target.value});
    validateForm(billingInfo, {...shippingInfo, [e.target.name]: e.target.value}, sameAsBilling);
  };

  const handleSameAsBillingChange = () => {
    const newVal = !sameAsBilling;
    setSameAsBilling(newVal);
    validateForm(billingInfo, shippingInfo, newVal);
  };

  const validateForm = (billInfo: any, shipInfo: any, sameAs: boolean) => {
    const billValid = Object.values(billInfo).every(val => (val as string).trim() !== '');
    if (sameAs) {
      setIsFormValid(billValid);
    } else {
      const shipValid = Object.values(shipInfo).every(val => (val as string).trim() !== '');
      setIsFormValid(billValid && shipValid);
    }
  };

  // Setup PayPal options
  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  return (
    <div className="bg-bg min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-8 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          
          <h1 className="font-display text-4xl font-bold mb-8 text-black">Checkout</h1>
          <form id="checkoutForm" className="space-y-10" onSubmit={(e) => e.preventDefault()}>
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
                    onChange={handleSameAsBillingChange}
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

            <div className="mt-6">
              {!isFormValid ? (
                <div className="text-center p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg mb-4 text-sm font-semibold">
                  Please fill in all required billing and shipping details to enable payment.
                </div>
              ) : (
                <PayPalScriptProvider options={initialOptions}>
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: total,
                            },
                            description: "IMANIGLOBAL order",
                          },
                        ],
                        application_context: {
                          shipping_preference: "NO_SHIPPING" // we collect shipping independently
                        }
                      });
                    }}
                    onApprove={async (data, actions) => {
                      if (!actions.order) return Promise.resolve();
                      return actions.order.capture().then(async (details) => {
                        const name = details.payer.name?.given_name || 'Customer';
                        
                        // Save the order to our backend
                        try {
                          await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                               paypal_order_id: details.id,
                               customer_name: `${billingInfo.firstName} ${billingInfo.lastName}`,
                               email: billingInfo.email,
                               phone: billingInfo.phone,
                               shipping_address: shippingInfo,
                               billing_address: billingInfo,
                               items: cart,
                               subtotal,
                               shipping_cost: shippingCost,
                               total,
                               status: details.status
                            })
                          });
                        } catch (err) {
                          console.error("Order save failed", err);
                        }

                        alert(`Transaction completed successfully by ${name}! Thank you for your purchase.`);
                        clearCart();
                        navigate('/');
                      });
                    }}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      // Fallback alert for the user if they cancel or it fails
                      alert("There was an issue processing your payment. Please try again or use a different method.");
                    }}
                  />
                </PayPalScriptProvider>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
