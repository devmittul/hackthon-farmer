import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sprout, Globe } from 'lucide-react';

export function Navbar() {
  const { user, language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    const langs = ['en', 'hi', 'te', 'ta'];
    const nextIdx = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIdx]);
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-sm font-medium transition-colors hover:text-green-600 text-foreground">Home</Link>
      <Link to="/features" className="text-sm font-medium transition-colors hover:text-green-600 text-foreground">Features</Link>
      {user && <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-green-600 text-foreground">Dashboard</Link>}
      <Link to="/about" className="text-sm font-medium transition-colors hover:text-green-600 text-foreground">About</Link>
      <Link to="/contact" className="text-sm font-medium transition-colors hover:text-green-600 text-foreground">Contact</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-green-100/80 p-2 rounded-full">
              <Sprout className="h-6 w-6 text-green-700" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-xl tracking-tight hidden sm:inline-block text-foreground">
              KrishiMitra
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Change Language" className="rounded-full hover:bg-muted">
            <Globe className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            <span className="sr-only">Toggle language</span>
          </Button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-light text-muted-foreground mr-2">Hello, <span className="font-medium text-foreground">{user.name}</span></span>
              <Button asChild variant="outline" className="rounded-full border-transparent bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-muted h-10 px-5">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-full h-10 px-5 hover:bg-muted">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full h-10 px-6 bg-foreground hover:bg-foreground/90 text-background font-medium shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-muted">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-border/50">
              <div className="flex flex-col gap-8 mt-10 px-4">
                <div className="flex flex-col gap-6">
                  <NavLinks />
                </div>
                <hr className="border-border/50" />
                {user ? (
                  <Button asChild className="w-full rounded-full h-12 bg-foreground text-background">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button variant="outline" asChild className="w-full rounded-full h-12 border-transparent bg-muted">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full rounded-full h-12 bg-foreground text-background">
                      <Link to="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
