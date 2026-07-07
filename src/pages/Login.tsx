import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sprout, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, authLoading, authError, clearError } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is shown from store
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding / Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-secondary flex-col justify-between p-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1592982537447-6f2a6a0b94cb?q=80&w=2070" 
            alt="Farming" 
            className="w-full h-full object-cover opacity-20 mix-blend-multiply filter contrast-125 saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3 font-semibold text-foreground">
          <div className="bg-primary/20 p-3 rounded-[24px]">
            <Sprout className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-foreground">KrishiMitra</span>
        </div>

        <div className="relative z-10 mb-10">
          <h1 className="text-5xl font-light text-foreground mb-8 leading-tight tracking-tight">
            The intelligence layer <br />
            for <span className="font-semibold">modern agriculture</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-md font-light leading-relaxed">
            Sign in to access your farm's dashboard, personalized crop recommendations, and real-time weather analytics.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-hidden bg-background">
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 font-semibold mb-16">
            <div className="bg-primary/20 p-3 rounded-[20px]">
              <Sprout className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-foreground">KrishiMitra</span>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-3">Welcome back</h2>
            <p className="text-lg text-muted-foreground font-light">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-foreground ml-1">Email Address</Label>
              <Input
                id="email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                autoComplete="email"
                className="h-14 rounded-full bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-visible:ring-primary focus-visible:border-primary px-6 text-base"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link to="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password" type={showPass ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {authError && (
              <div className="text-sm text-destructive bg-destructive/10 px-5 py-4 rounded-3xl flex items-start gap-3 mt-4">
                <div className="mt-0.5"><Loader2 className="h-4 w-4" /></div>
                <div>{authError}</div>
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium text-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98] mt-4" disabled={authLoading}>
              {authLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={1.5} />Signing in...</> : <>Sign In <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} /></>}
            </Button>

            <div className="pt-8 text-center">
              <p className="text-muted-foreground font-light text-base">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
