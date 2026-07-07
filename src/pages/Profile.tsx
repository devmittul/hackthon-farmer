import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Settings, Bell, User, Phone, MapPin, Map, Shield, LogOut, CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, language, setLanguage, logout, farms, updateProfile } = useAppStore();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync component state when the user profile changes/loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
    }
  }, [user]);

  // Calculate total farm size from registered farms
  const totalFarmSize = farms?.reduce((acc, farm) => acc + (farm.area_acres || 0), 0) || 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email,
        phone,
        location,
        farm_size_acres: totalFarmSize,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-4 pt-6"
      >
        <div className="bg-purple-100/80 p-4 rounded-full">
          <Settings className="h-8 w-8 text-purple-600" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Account Preferences</h1>
          <p className="text-muted-foreground text-lg font-light mt-2">Manage your identity, security, and notification settings.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-10">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-10">
          <Card className="glass-card flex flex-col relative overflow-hidden">
            <CardHeader className="pb-6 border-b border-border/50 bg-muted/30 px-8 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-3 text-foreground">
                    <User className="h-6 w-6 text-primary" strokeWidth={1.5} /> Identity Information
                  </CardTitle>
                  <CardDescription className="text-base font-light mt-1">Update your personal and farm details.</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> Profile Active
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 relative z-10 space-y-8 px-8 pb-8">
              <div className="flex items-center gap-6 mb-4">
                <div className="h-28 w-28 rounded-full bg-purple-100 border-4 border-white shadow-sm flex items-center justify-center text-4xl font-light text-purple-600 uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">{user?.name || 'User'}</h3>
                  <p className="text-base font-light text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-5 w-5" strokeWidth={1.5} /> {user?.location || 'Unknown Location'}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input 
                      required
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="pl-12 h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base focus-visible:ring-primary" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input 
                      required
                      type="email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="pl-12 h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base focus-visible:ring-primary" 
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-4 block">Logged in as: {user?.email}</span>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input 
                      required
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="pl-12 h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Village / District</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      className="pl-12 h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Farm Size (Acres)</Label>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input 
                      type="number" 
                      value={totalFarmSize.toFixed(2)} 
                      readOnly 
                      className="pl-12 h-14 bg-muted/30 border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base focus-visible:ring-primary cursor-not-allowed text-muted-foreground" 
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-4 block">
                    Calculated from your {farms?.length || 0} registered farm{farms?.length === 1 ? '' : 's'}. To update, manage your farms in the field mapping page.
                  </span>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-14 px-10 rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium text-base shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-0 transition-transform active:scale-[0.98] flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="space-y-10">
          <Card className="glass-card flex flex-col relative overflow-hidden">
            <CardHeader className="pb-6 border-b border-border/50 bg-muted/30 px-8 pt-8">
              <CardTitle className="text-xl font-semibold flex items-center gap-3 text-foreground">
                <Shield className="h-6 w-6 text-purple-600" strokeWidth={1.5} /> System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8 px-8 pb-8">
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-600" strokeWidth={1.5} /> Interface Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-base">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] border-border">
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                    <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                    <SelectItem value="mr">Marathi (मరాठी)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6 pt-6 border-t border-border/50">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-500" strokeWidth={1.5} /> Notification Rules
                </Label>
                <div className="flex flex-col gap-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="w-6 h-6 border-2 border-border rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-colors bg-white shadow-sm" />
                      <CheckCircle2 className="absolute text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">SMS Weather Alerts</span>
                      <p className="text-sm text-muted-foreground font-light mt-1">Critical rainfall and storm warnings.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="w-6 h-6 border-2 border-border rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-colors bg-white shadow-sm" />
                      <CheckCircle2 className="absolute text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">Disease Early Warnings</span>
                      <p className="text-sm text-muted-foreground font-light mt-1">Local outbreak notifications.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-6 h-6 border-2 border-border rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-colors bg-white shadow-sm" />
                      <CheckCircle2 className="absolute text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">Market Price Updates</span>
                      <p className="text-sm text-muted-foreground font-light mt-1">Weekly crop value summaries.</p>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-red-50/50 flex flex-col relative overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <LogOut className="h-6 w-6 text-red-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground">Session Management</h4>
                </div>
              </div>
              <Button 
                type="button"
                onClick={logout} 
                variant="destructive" 
                className="w-full h-14 rounded-full font-medium text-base bg-red-500 hover:bg-red-600 border-0 shadow-[0_8px_30px_rgba(239,68,68,0.2)] active:scale-[0.98] transition-transform"
              >
                Log Out Securely
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
