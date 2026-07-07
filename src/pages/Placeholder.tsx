import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Construction, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Placeholder() {
  const location = useLocation();
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'Page';
  const capitalizedName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 w-full pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-lg w-full flex flex-col items-center"
      >
        <div className="bg-white/80 backdrop-blur-3xl p-12 rounded-[40px] border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative z-10 w-full flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center relative z-10">
              <Construction className="h-10 w-10 text-purple-600" strokeWidth={1.5} />
            </div>
            <Sparkles className="absolute -top-2 -right-4 h-6 w-6 text-orange-400 animate-pulse" strokeWidth={1.5} />
          </div>
          
          <div className="inline-flex items-center rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-700 mb-6 uppercase tracking-widest border border-purple-100">
            Coming Soon
          </div>
          
          <h1 className="text-4xl font-semibold text-foreground mb-4 tracking-tight">
            {capitalizedName}
          </h1>
          
          <p className="text-muted-foreground font-light text-lg mb-10 max-w-sm leading-relaxed">
            This module is currently in development for the platform. We are actively engineering this feature.
          </p>
          
          <Button asChild className="h-14 px-10 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium text-base shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]">
            <Link to="/">
              <ArrowLeft className="mr-3 h-5 w-5" strokeWidth={1.5} /> Return Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
