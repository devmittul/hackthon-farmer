import { Link } from 'react-router-dom';
import { Sprout, Share2, Globe, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50 text-foreground py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-green-100/80 p-2 rounded-full">
              <Sprout className="h-6 w-6 text-green-700" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-xl tracking-tight text-foreground">KrishiMitra</span>
          </Link>
          <p className="text-muted-foreground text-base font-light leading-relaxed">
            Empowering small and marginal farmers with AI-driven intelligence, localized insights, and modern agricultural solutions.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="bg-white p-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-pointer transition-shadow">
              <Globe className="h-5 w-5 text-muted-foreground hover:text-green-600 transition-colors" strokeWidth={1.5} />
            </div>
            <div className="bg-white p-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-pointer transition-shadow">
              <Share2 className="h-5 w-5 text-muted-foreground hover:text-green-600 transition-colors" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-6 text-foreground">Quick Links</h3>
          <ul className="space-y-4 text-base font-light text-muted-foreground">
            <li><Link to="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
            <li><Link to="/features" className="hover:text-green-600 transition-colors">Features</Link></li>
            <li><Link to="/impact" className="hover:text-green-600 transition-colors">Our Impact</Link></li>
            <li><Link to="/contact" className="hover:text-green-600 transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-6 text-foreground">Services</h3>
          <ul className="space-y-4 text-base font-light text-muted-foreground">
            <li><Link to="/crop-recommendation" className="hover:text-green-600 transition-colors">Crop Recommendation</Link></li>
            <li><Link to="/irrigation" className="hover:text-green-600 transition-colors">Smart Irrigation</Link></li>
            <li><Link to="/disease-diagnosis" className="hover:text-green-600 transition-colors">Disease Diagnosis</Link></li>
            <li><Link to="/market-prices" className="hover:text-green-600 transition-colors">Market Prices</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-6 text-foreground">Contact Us</h3>
          <ul className="space-y-5 text-base font-light text-muted-foreground">
            <li className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <MapPin className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              </div>
              <span className="mt-0.5">Agri-Tech Park, Sector 42, New Delhi, India 110001</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Phone className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              </div>
              <span>+91 1800 123 4567 (Toll Free)</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Mail className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              </div>
              <span>support@krishimitra.ai</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-light">© {new Date().getFullYear()} KrishiMitra AI. All rights reserved.</p>
        <div className="flex gap-6 font-medium">
          <Link to="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-green-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
