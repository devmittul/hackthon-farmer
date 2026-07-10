import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Droplets, Wind, Leaf, Stethoscope, ArrowRight, MessageSquare, Thermometer, Send, Loader2, CheckCircle2, Activity, Map, BarChart3, Clock, AlertTriangle, MapPin, Mic, PhoneCall, Copy, RotateCcw, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { useChatContext } from '@/store/ChatContext';
import { weatherApi, chatApi, systemApi, twinApi, type WeatherData, type ChatMessage } from '@/services/api';

const WEATHER_TTL_MS = 15 * 60 * 1000;

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    activeLocation,
    weatherCache,
    weatherCachedAt,
    setActiveLocation,
    setWeatherCache,
    activeFarm,
    language,
    farms,
    loadFarms,
    lastRefreshedAt
  } = useAppStore();
  const [weather, setWeather] = useState<WeatherData | null>(weatherCache);
  const [weatherLoading, setWeatherLoading] = useState(!weatherCache);

  // Chat state from context — survives page navigation, clears on refresh/close
  const {
    chatMessages, setChatMessages,
    chatInput, setChatInput,
    chatLoading, setChatLoading,
    sessionId, setSessionId,
    selectedFarmId, setSelectedFarmId,
    resetChat,
  } = useChatContext();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);


  const [systemStatus, setSystemStatus] = useState<Record<string, { status: string; message: string }> | null>(null);
  const [systemLoading, setSystemLoading] = useState(true);

  const fetchWeather = async (loc: string, force = false) => {
    const cacheAge = weatherCachedAt ? Date.now() - weatherCachedAt : Infinity;
    // Serve from cache instantly if fresh and location hasn't changed
    if (!force && cacheAge < WEATHER_TTL_MS && weatherCache && loc === activeLocation) {
      setWeather(weatherCache);
      setWeatherLoading(false);
      return;
    }
    setWeatherLoading(true);
    try {
      const data = await weatherApi.get(loc, 5, 'en', force);
      setWeather(data);
      setWeatherCache(data);
    } catch {
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // On mount: serve cache immediately, refresh in background if stale
  useEffect(() => {
    // If coordinates format, reverse-geocode it to a proper exact location
    const coordRegex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    if (coordRegex.test(activeLocation)) {
      if (activeFarm && (activeFarm.village || activeFarm.district || activeFarm.state)) {
        const parts = [activeFarm.village, activeFarm.district, activeFarm.state].filter(Boolean);
        setActiveLocation(parts.join(', '));
      } else {
        const [lat, lon] = activeLocation.split(',').map(s => s.trim());
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            const place = data.address.city || data.address.town || data.address.village || data.address.county;
            const state = data.address.state || '';
            if (place) {
              const fullLoc = state ? `${place}, ${state}` : place;
              setActiveLocation(fullLoc);
            }
          })
          .catch(() => { });
      }
    }

    fetchWeather(activeLocation);
    setSystemLoading(true);
    systemApi.getStatus()
      .then(setSystemStatus)
      .catch(() => setSystemStatus(null))
      .finally(() => setSystemLoading(false));

    // Load farms for chat context
    loadFarms().catch((err) => console.error("Failed to load farms for chat context:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocation, lastRefreshedAt]);

  // Sync selected farm ID when activeFarm changes — only if not already set
  // (preserves user's selection when navigating back to Dashboard)
  useEffect(() => {
    if (activeFarm && !selectedFarmId) {
      setSelectedFarmId(activeFarm.farm_id);
    }
  }, [activeFarm, selectedFarmId, setSelectedFarmId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : language === 'mr' ? 'mr-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setChatInput(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Failed",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language, toast]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setChatInput('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const syncLocation = () => {
    if (!navigator.geolocation) return;
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const place = data.address.city || data.address.town || data.address.village || data.address.county || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          const state = data.address.state || '';
          const fullLoc = state ? `${place}, ${state}` : place;
          setActiveLocation(fullLoc);   // saves to store → persisted
          fetchWeather(fullLoc, true);  // force-refresh weather for new location
        } catch {
          const fallback = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setActiveLocation(fallback);
          fetchWeather(fallback, true);
        }
      },
      () => setWeatherLoading(false),
      { timeout: 8000 },
    );
  };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res: ChatMessage = await chatApi.send(
        msg,
        activeLocation,
        sessionId,
        language || 'en',
        undefined,
        selectedFarmId || activeFarm?.farm_id || undefined
      );
      if (res.session_id) setSessionId(res.session_id);
      setChatMessages(prev => [...prev, { role: 'ai', text: res.reply, intent: res.intent }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.name ?? 'Farmer'}
        </h1>
        <p className="text-muted-foreground text-xl font-light flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" strokeWidth={1.5} />
          Live overview for <span className="font-medium text-foreground">{activeLocation}</span>
        </p>
      </motion.div>

      {/* 12-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-8 xl:grid-cols-12 gap-8">

        {/* ROW 1 */}
        {/* Weather Card (6 cols) */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="md:col-span-8 xl:col-span-6">
          <Card className="h-full bg-white border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[40px] relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all">
            <div className="absolute top-0 right-0 p-32 bg-blue-50/50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-blue-700 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Cloud className="h-4 w-4" strokeWidth={1.5} />
                </div>
                Live Weather
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={syncLocation} disabled={weatherLoading} className="rounded-full bg-blue-50/50 hover:bg-blue-100 text-blue-700 h-9 px-4 text-xs font-medium border border-blue-100/50">
                  Sync GPS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-6 pb-8 px-8">
              {weatherLoading ? (
                <div className="h-24 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-300" strokeWidth={1.5} />
                </div>
              ) : weather ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="text-7xl font-light tracking-tight text-foreground">{weather.current.temperature_c}°</div>
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-medium capitalize text-foreground">{weather.current.condition}</span>
                      <span className="text-base text-muted-foreground font-light flex items-center gap-2">
                        <Thermometer className="h-4 w-4" strokeWidth={1.5} /> Feels like {weather.current.temperature_c + (weather.current.humidity_pct > 60 ? 2 : -1)}°
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base bg-blue-50/50 p-6 rounded-[24px] border border-blue-100/50 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <Droplets className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
                      <span className="font-light text-foreground">{weather.current.humidity_pct}% Humidity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Wind className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
                      <span className="font-light text-foreground">{weather.current.wind_kmh} km/h</span>
                    </div>
                    <div className="flex items-center gap-3 col-span-2 text-muted-foreground font-light mt-2 pt-4 border-t border-blue-100/50">
                      {weather.forecast?.[0]?.date && `Forecast: ${weather.forecast[0].condition}`}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-base text-muted-foreground py-8 text-center font-light">Weather data unavailable.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* RSK Helpdesk (3 cols) */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="md:col-span-4 xl:col-span-3">
          <Card className="h-full flex flex-col bg-white border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[40px] relative overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-green-700 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <PhoneCall className="h-4 w-4" strokeWidth={1.5} />
                </div>
                RSK HELPDESK
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 relative z-10 pt-4 pb-8 px-8 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">Kisan Call Center / RSK Hub</h3>
                <CardDescription className="text-sm font-light mb-5">Nirman Nagar Area Support</CardDescription>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Officer:</span>
                    <span className="font-bold text-foreground">Shri Rajesh Kumar</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Toll-Free:</span>
                    <span className="font-bold text-green-600">1962</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Direct Line:</span>
                    <span className="font-bold text-foreground">+91 94403 12345</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full h-11"
                  onClick={() => {
                    window.location.href = 'tel:1962';
                  }}
                >
                  Call Center
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-11 text-green-700 border-green-600 hover:bg-green-50 bg-white"
                  onClick={() => setShowHelpModal(true)}
                >
                  Request Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Farm Profile (3 cols) */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="md:col-span-4 xl:col-span-3">
          <Card className="h-full bg-white border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[40px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-orange-700 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Map className="h-4 w-4" strokeWidth={1.5} />
                </div>
                Farm Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-8">
              <div className="flex items-end gap-3 mt-2">
                <span className="text-6xl font-semibold tracking-tight text-foreground leading-none">
                  {(() => {
                    const total = farms.reduce((sum, f) => sum + (f.area_acres || 0), 0);
                    return total > 0 ? total.toFixed(1) : (user?.farm_size_acres ?? '—');
                  })()}
                </span>
                <span className="text-xl font-medium text-orange-600 pb-1">Acres</span>
              </div>
              <p className="text-sm text-muted-foreground font-light mt-2">Registered farm area</p>
              <div className="mt-6 pt-6 border-t border-border/50 flex items-center gap-3 text-sm text-orange-700 font-medium bg-orange-50 w-fit px-4 py-2 rounded-full border border-orange-100">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> Verified Profile
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROW 2 */}
        {/* Main Services (8 cols) */}
        <div className="md:col-span-8 xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">AI Intelligence Modules</h2>
            <Button variant="link" className="text-green-700 font-medium">View all modules &rarr;</Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[
              { title: 'Crop Recommendations', desc: 'Predictive models for your specific soil type.', icon: Leaf, href: '/dashboard/crop', color: 'bg-green-100 text-green-700' },
              { title: 'Irrigation Advisory', desc: 'Automated schedules with evapotranspiration.', icon: Droplets, href: '/dashboard/irrigation', color: 'bg-blue-100 text-blue-700' },
              { title: 'Disease Diagnosis', desc: 'Neural networks to classify foliar diseases.', icon: Stethoscope, href: '/dashboard/disease', color: 'bg-purple-100 text-purple-700' },
              { title: 'Yield Analytics', desc: 'Historical data mapping and predictions.', icon: BarChart3, href: '/dashboard/reports', color: 'bg-orange-100 text-orange-700' },
              { title: 'Field Activity', desc: 'Timeline of spraying and harvesting events.', icon: Clock, href: '/dashboard/reports', color: 'bg-indigo-100 text-indigo-700' },
              { title: 'Weather Alerts', desc: 'Severe anomaly detection for crops.', icon: AlertTriangle, href: '/dashboard/irrigation', color: 'bg-rose-100 text-rose-700' },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => navigate(service.href)}
                className="cursor-pointer"
              >
                <Card className="h-full flex flex-col bg-white border border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-border/50 transition-all">
                  <CardHeader className="pt-8 px-8 relative z-10">
                    <div className="mb-6">
                      <div className={`p-4 rounded-full ${service.color} inline-flex transform group-hover:scale-110 transition-transform duration-500`}>
                        <service.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground transition-all">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base font-light mt-3 text-muted-foreground leading-relaxed">
                      {service.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto relative z-10 pb-8 px-8">
                    <Button asChild className="w-full bg-muted hover:bg-foreground hover:text-background text-foreground font-medium rounded-full h-12 transition-all pointer-events-none">
                      <Link to={service.href} onClick={(e) => e.stopPropagation()}>
                        Launch Module <ArrowRight className="ml-3 h-4 w-4" strokeWidth={1.5} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Chat Widget (4 cols) */}
        <div className="md:col-span-8 xl:col-span-4 sticky top-32" style={{ height: 'calc(100vh - 160px)', minHeight: '600px', maxHeight: '900px' }}>
          <div className="h-full flex flex-col rounded-[40px] overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white/90 backdrop-blur-2xl">
            {/* Header */}
            <div className="flex-shrink-0 flex flex-col gap-4 px-8 py-6 border-b border-border/50 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-6 w-6 text-green-700" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                      KrishiMitra AI
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Gemini 2.0</span>
                    </div>
                    <div className="text-sm font-light text-muted-foreground">Your personalized farming assistant</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={resetChat}>
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Farm context selector */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Context:</span>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="text-xs font-medium bg-muted/65 hover:bg-muted text-foreground border-transparent rounded-full px-4 py-1.5 focus:ring-1 focus:ring-green-500 focus:border-transparent outline-none max-w-[200px] text-ellipsis"
                >
                  <option value="">General (Active Farm & Geo)</option>
                  {farms.map(f => (
                    <option key={f.farm_id} value={f.farm_id}>
                      {f.name || 'Unnamed Farm'} {f.village ? `(${f.village})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6" style={{ overscrollBehavior: 'contain' }}>
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-8">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold tracking-tight">Ask me anything</h3>
                    <p className="text-sm font-light text-muted-foreground max-w-xs mx-auto">
                      I'm your personalized farming assistant. Ask about crops, weather, soil health, pests, fertilizers and irrigation in your preferred language.
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-1 gap-3">
                    {[
                      { icon: '🌾', text: 'What crops should I grow this season?' },
                      { icon: '☁️', text: 'What is today\'s weather forecast?' },
                      { icon: '🍃', text: 'My crop leaves are turning yellow.' },
                      { icon: '🧪', text: 'Which fertilizer should I use?' }
                    ].map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(sug.text);
                          // We wait for state update to simulate typing then send
                          setTimeout(() => {
                            const btn = document.getElementById('chat-send-btn');
                            btn?.click();
                          }, 100);
                        }}
                        className="flex items-center gap-4 bg-muted/30 hover:bg-muted/80 p-4 rounded-[24px] border border-transparent transition-all text-left group w-full"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{sug.icon}</span>
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{sug.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence initial={false}>
                {chatMessages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-sm relative group ${m.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-slate-50 text-slate-900 border border-slate-100 rounded-bl-sm'
                      }`}>
                      {m.role === 'ai' && m.intent && (
                        <div className="text-[10px] text-green-700 mb-3 font-mono uppercase tracking-widest font-bold bg-green-100 w-fit px-2 py-0.5 rounded-full">
                          {m.intent}
                        </div>
                      )}
                      {m.role === 'ai' ? (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:text-sm prose-pre:p-4 prose-pre:bg-slate-900 prose-pre:rounded-xl prose-pre:text-slate-50 prose-strong:text-slate-900">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      )}
                      {m.role === 'ai' && (
                        <button
                          onClick={() => copyToClipboard(m.text)}
                          className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-foreground"
                          title="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 px-6 py-5 rounded-[24px] rounded-bl-sm flex gap-2 items-center">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input footer */}
            <div className="flex-shrink-0 p-5 bg-white border-t border-border/50">
              <div className="flex gap-3 items-center relative">
                <Button
                  onClick={toggleListen}
                  size="icon"
                  variant="ghost"
                  className={`absolute left-1.5 h-9 w-9 rounded-full z-10 ${isListening ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Voice Input"
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} strokeWidth={isListening ? 2 : 1.5} />
                </Button>
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder={isListening ? "Listening..." : "Ask anything..."}
                  disabled={chatLoading}
                  className="rounded-full bg-muted/30 border-transparent focus-visible:ring-green-500 h-12 pl-12 pr-14 text-sm shadow-sm w-full transition-all"
                />
                <Button
                  id="chat-send-btn"
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  className="absolute right-1.5 rounded-full h-9 w-9 bg-green-600 hover:bg-green-700 text-white shadow-sm flex-shrink-0 transition-transform active:scale-[0.96] disabled:bg-muted disabled:text-muted-foreground"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Support</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Full Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" placeholder="10-digit number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="village">Village</Label>
              <Input id="village" placeholder="Village Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issue">Issue Type</Label>
              <select id="issue" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="crop">Crop Health</option>
                <option value="weather">Weather Warning</option>
                <option value="market">Market Pricing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <textarea id="desc" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Briefly describe your issue..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelpModal(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowHelpModal(false);
              toast({
                title: "Success",
                description: "Help request submitted successfully.",
              });
            }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

