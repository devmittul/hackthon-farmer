import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sprout, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, authLoading, authError, clearError } = useAppStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    location: '', language: 'en',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        location: form.location || undefined,
      });
      navigate('/dashboard');
    } catch {
      // Error shown from store
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding / Illustration */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-primary/10 flex-col justify-between p-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070" 
            alt="Farming" 
            className="w-full h-full object-cover opacity-10 mix-blend-multiply filter contrast-125 saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3 font-semibold text-foreground">
          <div className="bg-white p-3 rounded-[24px] shadow-sm">
            <Sprout className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-semibold tracking-tight">KrishiMitra</span>
        </div>

        <div className="relative z-10 mb-10">
          <h1 className="text-5xl font-light text-foreground mb-8 leading-tight tracking-tight">
            Join the future of <br />
            <span className="font-semibold">agriculture</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-md font-light leading-relaxed">
            Create an account to gain access to AI-powered insights, predictive models, and real-time guidance for your farm.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 sm:p-12 xl:p-16 relative overflow-hidden bg-background">
        <div className="w-full max-w-2xl relative z-10">
          <div className="lg:hidden flex items-center gap-3 font-semibold mb-12">
            <div className="bg-primary/20 p-3 rounded-[20px]">
              <Sprout className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-foreground">KrishiMitra</span>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-3">Create your account</h2>
            <p className="text-lg text-muted-foreground font-light">Sign up in seconds. It's completely free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-foreground ml-1">Full Name</Label>
                <Input 
                  id="name" required value={form.name} onChange={e => set('name', e.target.value)} 
                  placeholder="Ramesh Kumar" 
                  className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="reg-email" className="text-sm font-medium text-foreground ml-1">Email Address</Label>
                <Input 
                  id="reg-email" type="email" required value={form.email} onChange={e => set('email', e.target.value)} 
                  placeholder="farmer@example.com" 
                  className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground ml-1">Phone Number</Label>
                <Input 
                  id="phone" required value={form.phone} onChange={e => set('phone', e.target.value)} 
                  placeholder="+91 9876543210" 
                  className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="reg-password" className="text-sm font-medium text-foreground ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password" type={showPass ? 'text' : 'password'} required
                    value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 pr-12 text-base"
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" 
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="location" className="text-sm font-medium text-foreground ml-1">Location (optional)</Label>
                <div className="flex gap-3">
                  <Input 
                    id="location" value={form.location} onChange={e => set('location', e.target.value)} 
                    placeholder="Punjab, India" 
                    className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base"
                  />
                  <Button 
                    type="button" variant="outline" size="sm" 
                    className="h-14 px-6 rounded-full border-border bg-white hover:bg-muted text-foreground transition-colors font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                          const data = await res.json();
                          const placeName = data.address.city || data.address.town || data.address.village || data.address.county || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                          const stateName = data.address.state || '';
                          set('location', stateName ? `${placeName}, ${stateName}` : placeName);
                        } catch (e) {
                          set('location', `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                        }
                      });
                    }
                  }}>
                    Sync
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label className="text-sm font-medium text-foreground ml-1">Preferred Language</Label>
                <Select value={form.language} onValueChange={v => set('language', v)}>
                  <SelectTrigger className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] border-border shadow-xl">
                    <SelectItem value="en" className="rounded-xl focus:bg-primary/10 cursor-pointer">English</SelectItem>
                    <SelectItem value="hi" className="rounded-xl focus:bg-primary/10 cursor-pointer">Hindi</SelectItem>
                    <SelectItem value="pa" className="rounded-xl focus:bg-primary/10 cursor-pointer">Punjabi</SelectItem>
                    <SelectItem value="mr" className="rounded-xl focus:bg-primary/10 cursor-pointer">Marathi</SelectItem>
                    <SelectItem value="te" className="rounded-xl focus:bg-primary/10 cursor-pointer">Telugu</SelectItem>
                    <SelectItem value="ta" className="rounded-xl focus:bg-primary/10 cursor-pointer">Tamil</SelectItem>
                    <SelectItem value="gu" className="rounded-xl focus:bg-primary/10 cursor-pointer">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {authError && (
              <div className="text-sm text-destructive bg-destructive/10 px-5 py-4 rounded-3xl flex items-start gap-3 mt-4">
                <div className="mt-0.5"><Loader2 className="h-4 w-4" /></div>
                <div>{authError}</div>
              </div>
            )}

            <Button type="submit" className="w-full h-14 mt-4 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium text-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98]" disabled={authLoading}>
              {authLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={1.5} />Creating account...</> : <>Create Account <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} /></>}
            </Button>

            <div className="pt-8 text-center">
              <p className="text-muted-foreground font-light text-base">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
