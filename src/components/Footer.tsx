import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-8 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-extrabold text-xl tracking-tight mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center p-1">
              <img 
                src="https://i.ibb.co/Y4pqNnfb/IMG-20260406-WA0014-removebg-preview.png" 
                alt="IMANIGLOBAL AGRO Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span>IMANIGLOBAL<span className="text-primary">AGRO</span></span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs mb-6">
            Premium agricultural commodities sourced directly from the best farms. Quality, reliability, and customer satisfaction.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/BlaizRealty" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/naijaverifiedproperties1?igsh=YzljYTk1ODg3Zg==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com/@NaijaVerifiedProperties" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/shop" className="hover:text-primary transition-colors">Shop Commodities</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Email: <a href="mailto:chukwuebukablaize11@gmail.com" className="hover:text-primary transition-colors">chukwuebukablaize11@gmail.com</a></li>
            <li>Phone: <a href="https://wa.me/2349127485007" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+234 912 748 5007</a></li>
            <li>Address: 123 Agro Hub, Global City</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} IMANIGLOBAL AGRO LIMITED. All rights reserved.
      </div>
    </footer>
  );
}
