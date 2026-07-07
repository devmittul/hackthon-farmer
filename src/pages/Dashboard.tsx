import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Droplets, Wind, Leaf, Stethoscope, ArrowRight, MessageSquare, Thermometer, Send, Loader2, CheckCircle2, XCircle, Activity, Map, BarChart3, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
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
    loadFarms
  } = useAppStore();
  const [weather, setWeather] = useState<WeatherData | null>(weatherCache);
  const [weatherLoading, setWeatherLoading] = useState(!weatherCache);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; intent?: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [selectedFarmId, setSelectedFarmId] = useState<string>(activeFarm?.farm_id || '');
  const chatEndRef = useRef<HTMLDivElement>(null);


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
          .catch(() => {});
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
  }, [activeLocation]);

  // Sync selected farm ID when activeFarm changes
  useEffect(() => {
    if (activeFarm) {
      setSelectedFarmId(activeFarm.farm_id);
    }
  }, [activeFarm]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

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

        {/* System Status (3 cols) */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="md:col-span-4 xl:col-span-3">
          <Card className="h-full flex flex-col bg-white border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[40px] relative overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-green-700 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Activity className="h-4 w-4" strokeWidth={1.5} />
                </div>
                Core Services
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 relative z-10 pt-6 pb-8 px-8">
              {systemStatus ? (
                <div className="space-y-6">
                  {[
                    { key: 'claude_api', name: 'Claude AI Engine' },
                    { key: 'weather', name: 'Meteo Data Source' },
                    { key: 'earth_engine', name: 'Earth Engine DB' },
                  ].map(({ key, name }) => {
                    const s = systemStatus[key];
                    const isLive = s?.status === 'Live';
                    return (
                      <div key={key} className="flex items-center justify-between text-base">
                        <span className="font-light text-foreground">{name}</span>
                        <div className={`flex items-center gap-2 font-medium text-xs px-3 py-1.5 rounded-full ${isLive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {isLive ? <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> : <XCircle className="h-3 w-3" strokeWidth={1.5} />}
                          {s?.status || 'Offline'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-base text-muted-foreground h-full flex items-center justify-center font-light">
                  {!systemLoading && "Status unavailable"}
                </div>
              )}
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
          {/* height is explicit on the outer div; all children use h-full + flex to fill it */}
          <div className="h-full flex flex-col rounded-[40px] overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white/90 backdrop-blur-2xl">

            {/* Header — fixed, never scrolls */}
            <div className="flex-shrink-0 flex flex-col gap-4 px-8 py-6 border-b border-border/50 bg-white">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-green-700" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">KrishiMitra Assistant</div>
                  <div className="text-sm font-light text-muted-foreground">Powered by Claude AI</div>
                </div>
              </div>

              {/* Farm context selector */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chat Context:</span>
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

            {/* Messages — takes all remaining height, scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4" style={{ overscrollBehavior: 'contain' }}>
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-light">Ask about weather, crops, <br/>or routes in any language.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {chatMessages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] px-5 py-4 rounded-[20px] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-foreground text-background rounded-br-none'
                        : 'bg-slate-50 text-slate-900 border border-slate-100 rounded-bl-none'
                    }`}>
                      {m.role === 'ai' && m.intent && (
                        <div className="text-[10px] text-green-700 mb-2 font-mono uppercase tracking-widest font-bold bg-green-100 w-fit px-2 py-0.5 rounded">
                          {m.intent}
                        </div>
                      )}
                      {m.role === 'ai' ? (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:text-sm prose-pre:p-3 prose-pre:bg-white prose-pre:rounded-xl prose-pre:text-xs text-slate-900 prose-strong:text-slate-900">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-[20px] rounded-bl-none flex gap-1.5 items-center">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input footer — fixed, never scrolls */}
            <div className="flex-shrink-0 p-5 bg-white border-t border-border/50">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {['What crop to grow?', 'Will it rain today?', 'Show market prices'].map(q => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors whitespace-nowrap border border-transparent flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask anything..."
                  disabled={chatLoading}
                  className="rounded-full bg-muted/30 border-transparent focus-visible:ring-green-500 h-12 px-5 text-sm shadow-sm"
                />
                <Button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  className="rounded-full h-12 w-12 bg-foreground hover:bg-foreground/90 text-background shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex-shrink-0 transition-transform active:scale-[0.96]"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

