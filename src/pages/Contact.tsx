import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Contact() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background pt-24 pb-40">
      <div className="container px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-700 mb-8 border border-orange-100">
            Get In Touch
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-8 leading-[1.1]">
            We're here to <br className="hidden md:block" />
            <span className="text-orange-700">help you grow.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            Have questions about the platform, API integrations, or enterprise partnerships? Reach out to our support team.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="bg-orange-100 p-4 rounded-full text-orange-700 shrink-0">
                    <MapPin className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-2">Office</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Agri-Tech Park, Sector 42<br />
                      New Delhi, India 110001
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="bg-blue-100 p-4 rounded-full text-blue-700 shrink-0">
                    <Phone className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-2">Phone</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      +91 1800 123 4567<br />
                      Mon-Fri, 9am - 6pm IST
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="bg-green-100 p-4 rounded-full text-green-700 shrink-0">
                    <Mail className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-2">Email</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      support@krishimitra.ai<br />
                      sales@krishimitra.ai
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-3xl font-semibold text-foreground mb-8">Send a Message</h3>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest ml-1">First Name</Label>
                  <Input placeholder="John" className="h-14 rounded-full bg-muted/50 border-transparent focus-visible:ring-orange-500 text-base px-6 shadow-sm" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest ml-1">Last Name</Label>
                  <Input placeholder="Doe" className="h-14 rounded-full bg-muted/50 border-transparent focus-visible:ring-orange-500 text-base px-6 shadow-sm" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest ml-1">Email Address</Label>
                <Input type="email" placeholder="john@example.com" className="h-14 rounded-full bg-muted/50 border-transparent focus-visible:ring-orange-500 text-base px-6 shadow-sm" />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest ml-1">Your Message</Label>
                <textarea placeholder="How can we help you?" className="flex min-h-[160px] w-full rounded-[24px] bg-muted/50 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-base p-6 shadow-sm resize-none" />
              </div>
              <Button type="submit" className="w-full h-16 rounded-full bg-foreground hover:bg-foreground/90 text-background text-lg font-medium shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]">
                Send Message <Send className="ml-3 h-5 w-5" strokeWidth={1.5} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
