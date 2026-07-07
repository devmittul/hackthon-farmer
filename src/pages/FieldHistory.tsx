import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, Sparkles, ChevronRight, HelpCircle, 
  MapPin, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { farmApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

import type { Farm } from '@/types/farm';

export default function FieldHistory() {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadFarms = async () => {
    try {
      const data = await farmApi.list();
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarmId(data[0].farm_id);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error loading history",
        description: err.message || "Failed to load farms."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const selectedFarm = farms.find(f => f.farm_id === selectedFarmId);
  const history = selectedFarm?.satellite_history || [];

  // Sort history newest first
  const sortedHistory = [...history].sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());

  const getNDVIBadge = (ndvi: number) => {
    if (ndvi < 0.15) return "bg-rose-100 text-rose-700 border-rose-200";
    if (ndvi < 0.35) return "bg-orange-100 text-orange-700 border-orange-200";
    if (ndvi < 0.55) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <Clock className="h-10 w-10 text-green-600" strokeWidth={1.5} />
            Farm Historical Records
          </h1>
          <p className="text-muted-foreground text-lg font-light mt-1">
            Chronological timeline of all GEE satellite evaluations and vegetation maps.
          </p>
        </div>

        {/* Dropdown selector */}
        {farms.length > 0 && (
          <div className="flex items-center gap-3 bg-white border border-border px-5 py-3 rounded-full shadow-sm w-full md:w-80">
            <span className="text-sm font-medium text-slate-500 flex-shrink-0">Select Farm:</span>
            <Select value={selectedFarmId} onValueChange={(id) => setSelectedFarmId(id)}>
              <SelectTrigger className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 font-semibold text-slate-700 h-6 p-0 text-sm">
                <SelectValue placeholder="Choose a farm" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                {farms.map(f => (
                  <SelectItem key={f.farm_id} value={f.farm_id} className="rounded-xl">
                    {f.name} ({f.area_acres?.toFixed(1) || 0} ac)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      ) : farms.length === 0 ? (
        <Card className="border-0 shadow-md bg-white rounded-[32px] p-12 text-center max-w-md mx-auto mt-10">
          <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-bold mb-2">No Saved Farms Found</h3>
          <p className="text-sm text-muted-foreground font-light mb-6">
            You must register and draw your farm boundaries to generate and review historical logs.
          </p>
          <Button asChild className="rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold">
            <Link to="/dashboard/field-mapping">Go to Field Mapping</Link>
          </Button>
        </Card>
      ) : sortedHistory.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Summary Column */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-lg bg-white rounded-[32px] p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Farm Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-light">Name</span>
                  <span className="font-semibold text-slate-700">{selectedFarm?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-light">Registered Area</span>
                  <span className="font-semibold text-slate-700">{selectedFarm?.area_acres?.toFixed(1) || 0} Acres</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-light">History Count</span>
                  <span className="font-semibold text-slate-700">0 Readings</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Timeline Placeholder */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-md bg-white rounded-[32px] p-12 text-center h-[350px] flex flex-col items-center justify-center gap-4">
              <Info className="h-16 w-16 text-slate-300" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-slate-700">No Timeline Readings</h3>
              <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto">
                No GEE evaluations have been performed on <strong>{selectedFarm?.name}</strong> yet. Run a scan to establish the first historical anchor.
              </p>
              <Button asChild className="rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                <Link to={`/dashboard/satellite-analysis?field_id=${selectedFarmId}`}>Perform First Scan</Link>
              </Button>
            </Card>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Farm overview card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-0 shadow-lg bg-white rounded-[32px] p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Farm Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-light">Name</span>
                  <span className="font-semibold text-slate-700">{selectedFarm?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-light">Registered Area</span>
                  <span className="font-semibold text-slate-700">{selectedFarm?.area_acres?.toFixed(1) || 0} Acres</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-light">Timeline Records</span>
                  <span className="font-semibold text-slate-700">{sortedHistory.length} Scans</span>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold h-11">
                  <Link to={`/dashboard/satellite-analysis?field_id=${selectedFarmId}`}>
                    Trigger Fresh GEE Scan
                  </Link>
                </Button>
              </div>
            </Card>

            <Card className="border-0 shadow-md bg-white rounded-[24px] p-6 space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-green-600" /> Historical Tracking
              </h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                By capturing spectral readings throughout the seeding, growing, and pre-harvest stages, you map a distinct vegetation curve representing crop growth vigor and maturity rates.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Chronological Vertical Timeline */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-lg bg-white rounded-[32px] p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                Timeline of Measurements
              </h3>
              
              <div className="relative border-l border-slate-100 pl-6 ml-4 space-y-10">
                {sortedHistory.map((item, idx) => (
                  <div key={idx} className="relative">
                    
                    {/* Circle Node indicator */}
                    <div className="absolute -left-[35px] top-1 bg-white h-7 w-7 rounded-full border-2 border-green-600 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="h-4.5 w-4.5 fill-current text-white bg-green-600 rounded-full" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(item.captured_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Scan #{sortedHistory.length - idx}</span>
                      </div>

                      <div className="bg-slate-50/50 p-5 rounded-[24px] border border-slate-100/70 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between gap-4 md:items-center">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-800 text-lg">{item.crop_health}</h4>
                          <p className="text-xs text-slate-500 font-light">Stage: {item.harvest_stage}</p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getNDVIBadge(item.ndvi)}`}>
                            NDVI: {item.ndvi.toFixed(3)}
                          </div>
                          
                          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Index: {item.vegetation_index}%
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
