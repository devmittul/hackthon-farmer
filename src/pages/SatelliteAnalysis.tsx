import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Sparkles, RefreshCw, BarChart2, Calendar, ShieldCheck, 
  MapPin, Leaf, TrendingUp, AlertCircle, Info, ChevronRight, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { farmApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

import type { Farm } from '@/types/farm';

export default function SatelliteAnalysis() {
  const [searchParams] = useSearchParams();
  const farmIdParam = searchParams.get('field_id'); // keep field_id query parameter fallback for routing compatibility
  const { toast } = useToast();

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr) return null;
    const imgDate = new Date(dateStr);
    const today = new Date();
    imgDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - imgDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  };

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Fetch all farms
  const loadFarms = async (selectId?: string) => {
    try {
      setLoadingFarms(true);
      const data = await farmApi.list();
      setFarms(data || []);
      
      if (data && data.length > 0) {
        // If a query parameter was passed, select it. Otherwise select the first farm.
        const idToSelect = selectId || farmIdParam || data[0].farm_id;
        setSelectedFarmId(idToSelect);
        
        // Find if this farm already has saved satellite data
        const currentFarm = data.find((f: any) => f.farm_id === idToSelect);
        if (currentFarm && currentFarm.latest_satellite) {
          setAnalysisResult({
            ndvi: currentFarm.latest_satellite.ndvi,
            crop_health: currentFarm.latest_satellite.crop_health,
            vegetation_index: currentFarm.latest_satellite.vegetation_index,
            harvest_detection: currentFarm.latest_satellite.harvest_stage,
            analysis_date: currentFarm.latest_satellite.captured_at,
            data_source: currentFarm.latest_satellite.data_source || 'Sentinel-2 SR (GEE)',
            history: currentFarm.satellite_history || []
          });
        } else {
          setAnalysisResult(null);
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error loading farms",
        description: err.message || "Failed to load farms."
      });
    } finally {
      setLoadingFarms(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [farmIdParam]);

  // Handle Farm Dropdown Change
  const handleFarmChange = (id: string) => {
    setSelectedFarmId(id);
    const currentFarm = farms.find(f => f.farm_id === id);
    if (currentFarm && currentFarm.latest_satellite) {
      setAnalysisResult({
        ndvi: currentFarm.latest_satellite.ndvi,
        crop_health: currentFarm.latest_satellite.crop_health,
        vegetation_index: currentFarm.latest_satellite.vegetation_index,
        harvest_detection: currentFarm.latest_satellite.harvest_stage,
        analysis_date: currentFarm.latest_satellite.captured_at,
        data_source: currentFarm.latest_satellite.data_source || 'Sentinel-2 SR (GEE)',
        history: currentFarm.satellite_history || []
      });
    } else {
      setAnalysisResult(null);
    }
  };

  // Trigger GEE Satellite Analysis
  const handleAnalyze = async () => {
    if (!selectedFarmId) return;
    
    setAnalyzing(true);
    try {
      const res = await farmApi.analyze(selectedFarmId);
      
      // Update selected farm data in list
      setFarms(prev => prev.map(f => {
        if (f.farm_id === selectedFarmId) {
          const updatedHistory = [...(f.satellite_history || [])];
          const newReading = {
            captured_at: res.analysis_date || new Date().toISOString().split('T')[0],
            ndvi: res.ndvi,
            crop_health: res.crop_health,
            vegetation_index: res.vegetation_index,
            harvest_stage: res.harvest_detection
          };
          // Avoid duplicate reading on same day
          if (!updatedHistory.some(h => h.captured_at === res.analysis_date)) {
            updatedHistory.push(newReading);
          }
          return {
            ...f,
            latest_satellite: {
              captured_at: res.analysis_date,
              ndvi: res.ndvi,
              crop_health: res.crop_health,
              vegetation_index: res.vegetation_index,
              harvest_stage: res.harvest_detection,
              data_source: res.data_source
            },
            satellite_history: updatedHistory
          };
        }
        return f;
      }));

      // Set current analysis state
      setAnalysisResult({
        ...res,
        history: farms.find(f => f.farm_id === selectedFarmId)?.satellite_history || []
      });

      toast({
        title: "Analysis Completed",
        description: `Satellite metrics updated successfully for ${farms.find(f => f.farm_id === selectedFarmId)?.name}.`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "Google Earth Engine analysis failed."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedFarm = farms.find(f => f.farm_id === selectedFarmId);

  // SVG Line Chart Generator for history
  const renderHistoryChart = () => {
    const history = selectedFarm?.satellite_history || [];
    if (history.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center text-muted-foreground font-light text-sm">
          Insufficient historical readings (need at least 2 analyses to graph trends).
        </div>
      );
    }

    // Sort by date
    const sortedHistory = [...history].sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
    
    // Width/Height parameters
    const w = 500;
    const h = 200;
    const padding = 30;
    
    const xMin = padding;
    const xMax = w - padding;
    const yMin = padding;
    const yMax = h - padding;

    // NDVI min/max values normally range from 0 to 1
    const ndviMinVal = 0;
    const ndviMaxVal = 1;

    // Map points to SVG coordinates
    const points = sortedHistory.map((item, idx) => {
      const x = xMin + (idx / (sortedHistory.length - 1)) * (xMax - xMin);
      const ndvi = item.ndvi ?? 0;
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = yMax - ((ndvi - ndviMinVal) / (ndviMaxVal - ndviMinVal)) * (yMax - yMin);
      return { x, y, ...item };
    });

    // Generate SVG path description
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
      <div className="w-full space-y-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible">
          {/* Y Axis Gridlines */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((val, idx) => {
            const y = yMax - (val / 1) * (yMax - yMin);
            return (
              <g key={idx}>
                <line x1={xMin} y1={y} x2={xMax} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <text x={xMin - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">{val.toFixed(1)}</text>
              </g>
            );
          })}
          
          {/* Chart Line */}
          <path d={pathD} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="hover:fill-green-200/40 transition-colors" />
              
              {/* Tooltip on hover */}
              <title>{`Date: ${new Date(p.captured_at).toLocaleDateString()}\nNDVI: ${p.ndvi}`}</title>
            </g>
          ))}
        </svg>

        {/* Legend / Timeline */}
        <div className="flex justify-between px-4 text-[10px] text-slate-400 font-mono">
          <span>{new Date(sortedHistory[0].captured_at).toLocaleDateString()}</span>
          <span>Timeline (NDVI Readings)</span>
          <span>{new Date(sortedHistory[sortedHistory.length - 1].captured_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  // NDVI gauge color calculations
  const getNDVIColor = (ndvi: number) => {
    if (ndvi < 0.15) return 'text-slate-400';
    if (ndvi < 0.35) return 'text-orange-500';
    if (ndvi < 0.5) return 'text-yellow-500';
    return 'text-green-600';
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <Globe className="h-10 w-10 text-green-600" strokeWidth={1.5} />
            Satellite GEE Analysis
          </h1>
          <p className="text-muted-foreground text-lg font-light mt-1">
            Compute precise crop indices, canopy density, and plant water stress on Earth Engine.
          </p>
        </div>

        {/* Dropdown selector */}
        {farms.length > 0 && (
          <div className="flex items-center gap-3 bg-white border border-border px-5 py-3 rounded-full shadow-sm w-full md:w-80">
            <span className="text-sm font-medium text-slate-500 flex-shrink-0">Select Farm:</span>
            <Select value={selectedFarmId} onValueChange={handleFarmChange}>
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

      {loadingFarms ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"
          />
          <p className="text-sm font-light">Loading farm registries...</p>
        </div>
      ) : farms.length === 0 ? (
        <Card className="border-0 shadow-md bg-white rounded-[32px] p-12 text-center max-w-md mx-auto mt-10">
          <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-bold mb-2">No Saved Farms Found</h3>
          <p className="text-sm text-muted-foreground font-light mb-6">
            You must define your farm coordinates and save boundary polygons before running GEE satellite analysis.
          </p>
          <Button asChild className="rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold">
            <Link to="/dashboard/field-mapping">Go to Field Mapping</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Selected Farm Info & Trigger button */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="border-0 shadow-lg bg-white rounded-[32px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Target Farm Boundaries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                    <MapPin className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{selectedFarm?.name}</h3>
                    <p className="text-xs text-muted-foreground font-light">{selectedFarm?.area_acres?.toFixed(1) || 0} Acres registered</p>
                  </div>
                </div>

                <div className="text-sm font-light text-slate-500 leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" strokeWidth={1.5} />
                  <span>
                    Analysis submits the exact farm boundary polygon coordinates to Google Earth Engine. GEE reduces the Sentinel-2 spectral indices inside your polygon to avoid averaging non-farm surfaces.
                  </span>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full h-12 transition-transform active:scale-[0.98]"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reducing GEE Indices...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                      Run Live GEE Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Guidelines Card */}
            <Card className="border-0 shadow-md bg-white rounded-[24px] p-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">NDVI Index Legend</h4>
              <div className="space-y-3">
                {[
                  { range: "0.0 - 0.15", label: "Bare Soil or Fallow Land", color: "bg-slate-300" },
                  { range: "0.15 - 0.35", label: "Early Seedling / Moderate Stress", color: "bg-orange-400" },
                  { range: "0.35 - 0.55", label: "Vegetative / Healthy Growth", color: "bg-yellow-400" },
                  { range: "0.55 - 0.80", label: "Dense Canopy / Crop Maturation", color: "bg-green-500" },
                  { range: "0.80 - 1.00", label: "Peak Health / Canopy Saturation", color: "bg-emerald-600" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="font-mono text-slate-500 w-16">{item.range}</span>
                    <span className="font-light text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL: Results, Gauges & Charts */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {analyzing ? (
              <Card className="border-0 shadow-lg bg-white rounded-[32px] p-12 text-center h-[500px] flex flex-col items-center justify-center gap-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center"
                >
                  <Globe className="h-10 w-10 text-green-600 animate-pulse" strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Processing Satellite Polygons</h3>
                  <p className="text-sm font-light text-slate-400 max-w-sm mx-auto">
                    Retrieving the latest Sentinel-2 MSI cloud-free imagery. Reducing geometry matrices and extracting spectral reflection bands.
                  </p>
                </div>
                <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="bg-green-600 h-full w-1/2 relative rounded-full"
                  />
                </div>
              </Card>
            ) : analysisResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <Card className="border-0 shadow-md bg-white rounded-[24px] p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Mean NDVI Index</span>
                      <div className={`text-4xl font-bold mt-2 ${getNDVIColor(analysisResult.ndvi)}`}>
                        {analysisResult.ndvi !== null && analysisResult.ndvi !== undefined ? analysisResult.ndvi.toFixed(3) : '—'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-4 flex flex-wrap items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>Date: {analysisResult.analysis_date}</span>
                      {(() => {
                        const daysAgo = getDaysAgo(analysisResult.analysis_date);
                        if (daysAgo === null) return null;
                        const label = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days old`;
                        const colorClass = daysAgo <= 3 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : daysAgo <= 7 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100';
                        return (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-sans font-semibold ${colorClass}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </div>
                  </Card>

                  <Card className="border-0 shadow-md bg-white rounded-[24px] p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Canopy Health Status</span>
                      <div className="text-xl font-bold text-slate-800 mt-3 flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        {analysisResult.crop_health}
                      </div>
                    </div>
                    <div className="text-[10px] text-green-700 font-mono mt-4 bg-green-50 w-fit px-2 py-0.5 rounded border border-green-100">
                      Index Score: {analysisResult.vegetation_index}%
                    </div>
                  </Card>

                  <Card className="border-0 shadow-md bg-white rounded-[24px] p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Harvest Detection</span>
                      <div className="text-xl font-bold text-slate-800 mt-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        {analysisResult.harvest_detection}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-4">
                      Sensor Source: {analysisResult.data_source || 'Sentinel-2'}
                    </div>
                  </Card>

                </div>

                {/* Additional Geo-Indices Card if computed by backend */}
                {((analysisResult.ndwi !== null && analysisResult.ndwi !== undefined) || 
                  (analysisResult.evi !== null && analysisResult.evi !== undefined)) && (
                  <Card className="border-0 shadow-md bg-white rounded-[24px] p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Detailed Spectral Indicies</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {analysisResult.ndwi !== null && analysisResult.ndwi !== undefined && (
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                          <span className="text-xs text-blue-700 font-semibold">Water Stress Index (NDWI)</span>
                          <div className="text-2xl font-extrabold text-blue-800 mt-1">{analysisResult.ndwi.toFixed(3)}</div>
                          <span className="text-[10px] text-blue-600 font-light mt-1 block">Range: {analysisResult.ndwi_min?.toFixed(2)} to {analysisResult.ndwi_max?.toFixed(2)}</span>
                        </div>
                      )}
                      {analysisResult.evi !== null && analysisResult.evi !== undefined && (
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                          <span className="text-xs text-emerald-700 font-semibold">Enhanced Vegetation Index (EVI)</span>
                          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{analysisResult.evi.toFixed(3)}</div>
                          <span className="text-[10px] text-emerald-600 font-light mt-1 block">Range: {analysisResult.evi_min?.toFixed(2)} to {analysisResult.evi_max?.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* GEE Satellite details message */}
                {analysisResult.message && (
                  <Card className="border-0 shadow-md bg-amber-50/50 border border-amber-100 rounded-[24px] p-5 flex gap-3 text-sm text-amber-800 font-light">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <span className="font-semibold block mb-0.5">Satellite Offline Fallback</span>
                      {analysisResult.message}
                    </div>
                  </Card>
                )}

                {/* Historical Trends Chart */}
                <Card className="border-0 shadow-lg bg-white rounded-[32px] p-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                    Historical Vegetation Trends (NDVI Curve)
                  </h3>
                  {renderHistoryChart()}
                </Card>

              </motion.div>
            ) : (
              <Card className="border-0 shadow-md bg-white rounded-[32px] p-12 text-center h-[400px] flex flex-col items-center justify-center gap-4">
                <Globe className="h-16 w-16 text-slate-300" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-slate-700">No GEE Index Data Available</h3>
                <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto">
                  You haven't run satellite calculations for <strong>{selectedFarm?.name}</strong> yet. Click the button to process Earth Engine matrices.
                </p>
              </Card>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
