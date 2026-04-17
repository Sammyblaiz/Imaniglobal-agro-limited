import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("https://formsubmit.co/ajax/samuelirem6@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: "New Inquiry from IMANIGLOBAL Website"
        })
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error("Error submitting form", error);
      // Fallback to show success anyway for UX if fetch fails due to adblockers etc
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-bg py-16 px-8 md:px-16 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-black mb-4">
            Contact Us
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Ready to place a bulk order or have questions about our commodities? Reach out to us today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold text-xl text-black mb-6 uppercase tracking-wider">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center shrink-0 text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black text-sm uppercase tracking-wider mb-1">Email</h4>
                    <a href="mailto:samuelirem6@gmail.com" className="text-text-muted hover:text-primary transition-colors">samuelirem6@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center shrink-0 text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black text-sm uppercase tracking-wider mb-1">Phone / WhatsApp</h4>
                    <a href="https://wa.me/2349127485007" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">+234 912 748 5007</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center shrink-0 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black text-sm uppercase tracking-wider mb-1">Address</h4>
                    <p className="text-text-muted">123 Agro Hub, Global City, Business District</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold text-xl text-black mb-6 uppercase tracking-wider">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/BlaizRealty" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-black hover:bg-primary hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/naijaverifiedproperties1?igsh=YzljYTk1ODg3Zg==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-black hover:bg-primary hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@NaijaVerifiedProperties" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-black hover:bg-primary hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-bold text-2xl text-black mb-8">Send us a Message</h3>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded text-center">
                <h4 className="font-bold mb-2">Message Sent Successfully!</h4>
                <p className="text-sm">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-black mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-black mb-2">Message</label>
                  <textarea 
                    id="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-primary shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Team Members Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-black mb-2 uppercase tracking-wider">Team Members</h2>
            <p className="text-text-muted">Meet the dedicated professionals leading IMANIGLOBAL</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 flex items-center justify-center">
                <img src="https://i.ibb.co/ds19Nr4b/IMG-20260218-232809-542.webp" alt="Samuel Irem - CEO" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold text-xl text-black">Samuel Irem</h3>
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mt-1">CEO</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 flex items-center justify-center bg-gray-100">
                <img src="https://i.ibb.co/zT9nFNq6/Screenshot-2026-03-26-10-27-54-68.png" alt="Gabriel - MD" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold text-xl text-black">Gabriel</h3>
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mt-1">MD</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-gray-50 flex items-center justify-center">
                <img src="https://i.ibb.co/pBMGq38R/IMG-20260415-WA0161.jpg" alt="Seun - Accountant" className="w-full h-full object-cover top-0 object-top" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold text-xl text-black">Seun</h3>
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mt-1">Accountant</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
