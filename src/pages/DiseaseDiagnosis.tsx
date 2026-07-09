import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, UploadCloud, Camera, Mic, MicOff, CheckCircle2, AlertTriangle, AlertOctagon, Scan, ShieldAlert, FileWarning, Leaf, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';

export default function DiseaseDiagnosis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Voice Recognition ──────────────────────────────────────────────────────
  const { toast } = useToast();
  const speech = useSpeechRecognition();
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceAnalyzing, setVoiceAnalyzing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const voiceSubmittedRef = useRef(false);

  // Show toast on speech errors
  useEffect(() => {
    if (speech.status === 'error' && speech.errorMessage) {
      toast({ title: 'Voice Input Error', description: speech.errorMessage, variant: 'destructive' });
    }
  }, [speech.status, speech.errorMessage, toast]);

  // Auto-submit when transcript is finalized after release
  useEffect(() => {
    if (speech.status === 'processing' && speech.transcript && !voiceSubmittedRef.current) {
      voiceSubmittedRef.current = true;
      setVoiceTranscript(speech.transcript);
      // Trigger voice diagnosis
      handleVoiceDiagnose(speech.transcript);
      speech.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.status, speech.transcript]);

  const handleVoiceDiagnose = useCallback(async (text: string) => {
    if (!text.trim() || voiceAnalyzing) return;
    setVoiceAnalyzing(true);
    setVoiceProgress(0);
    setVoiceError(null);
    setVoiceResult(null);

    const interval = setInterval(() => {
      setVoiceProgress(prev => prev >= 95 ? (clearInterval(interval), 95) : prev + 5);
    }, 100);

    try {
      // Reuse the Gemini diagnosis with a text-only prompt
      const apiKeysRaw = import.meta.env.VITE_GEMINI_API_KEY as string;
      const model = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.5-flash';
      if (!apiKeysRaw) throw new Error('VITE_GEMINI_API_KEY is not set.');
      const apiKeys = apiKeysRaw.split(',').map(k => k.trim()).filter(Boolean);
      if (apiKeys.length === 0) throw new Error('No valid Gemini API keys.');

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const apiKey of apiKeys) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: [
                'A farmer describes their crop symptoms:',
                `"${text}"`,
                'Based on this description, diagnose the most likely crop disease.',
                'Return a JSON object with these exact keys:',
                '"disease" (string), "confidence" (number 0-100),',
                '"severity" (exactly one of: "Low", "Medium", "High"),',
                '"symptoms" (array of 3-5 strings), "causes" (array of 2-4 strings),',
                '"treatment" (array of 3-5 actionable strings),',
                '"prevention" (array of 3-5 strings).',
              ].join(' ') }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          });
          if (response.ok) break;
          const errBody = await response.json().catch(() => ({}));
          const code = (errBody as any)?.error?.code || response.status;
          if (code === 429 || code === 401 || code === 403 || code >= 500) {
            lastError = new Error(`Gemini API error ${code}`);
            continue;
          }
          throw new Error((errBody as any)?.error?.message || `API error ${code}`);
        } catch (networkErr: any) {
          lastError = networkErr;
        }
      }

      if (!response || !response.ok) throw lastError || new Error('All API keys failed.');

      const rawJson: any = await response.json();
      const candidate = rawJson?.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) throw new Error('No diagnosis returned.');
      if (candidate.finishReason === 'MAX_TOKENS') throw new Error('Response truncated. Try again.');

      const rawText: string = candidate.content.parts[0].text;
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      let data;
      try { data = JSON.parse(cleaned); } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
        else throw new Error('AI returned unexpected format.');
      }

      clearInterval(interval);
      setVoiceProgress(100);
      setTimeout(() => { setVoiceResult(data); setVoiceAnalyzing(false); }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setVoiceAnalyzing(false);
      setVoiceError(err.message || 'Voice diagnosis failed.');
    }
  }, [voiceAnalyzing]);

  const handleMicDown = useCallback(() => {
    if (voiceAnalyzing || analyzing) return;
    voiceSubmittedRef.current = false;
    speech.start();
  }, [voiceAnalyzing, analyzing, speech]);

  const handleMicUp = useCallback(() => {
    speech.stop();
  }, [speech]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setProgress(0);
    setError(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const data = await api.diagnoseDisease(file);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setAnalyzing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setAnalyzing(false);
      setError(err.message || 'Analysis failed. Please try again.');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={1.5} />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-orange-500" strokeWidth={1.5} />;
      case 'high': return <AlertOctagon className="h-5 w-5 text-red-500" strokeWidth={1.5} />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100/50';
      case 'medium': return 'bg-orange-100/50';
      case 'high': return 'bg-red-100/50';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-4 pt-6"
      >
        <div className="bg-rose-100/80 p-4 rounded-full">
          <Stethoscope className="h-8 w-8 text-rose-700" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Disease Diagnosis</h1>
          <p className="text-muted-foreground text-lg font-light mt-2">Computer vision neural networks to instantly classify crop health.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Input Column */}
        <Card className="glass-card flex flex-col relative overflow-hidden">
          <CardHeader className="pb-6 border-b border-border/50 bg-muted/30 relative z-10 px-8 pt-8">
            <CardTitle className="text-xl font-semibold flex items-center gap-3 text-foreground">
              <Camera className="h-6 w-6 text-primary" strokeWidth={1.5} /> Image Upload
            </CardTitle>
            <CardDescription className="text-base font-light mt-1">Upload a clear photo of the affected plant.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 relative z-10 px-8 pb-8">
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-full p-1.5 mb-8">
                <TabsTrigger value="image" className="rounded-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Upload Image</TabsTrigger>
                <TabsTrigger value="voice" className="rounded-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Voice Assist</TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-8">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[360px]",
                    previewUrl ? 'border-primary/30 bg-primary/5' : 'border-border bg-white hover:bg-muted/30',
                    analyzing && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => !analyzing && fileInputRef.current?.click()}
                  style={{ cursor: analyzing ? 'default' : 'pointer' }}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {previewUrl ? (
                    <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden mb-6 shadow-sm border border-border">
                      <img src={previewUrl} alt="Preview" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                      {analyzing && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                          <Scan className="h-14 w-14 text-primary animate-pulse" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12">
                      <div className="bg-muted p-5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/10 transition-colors">
                        <UploadCloud className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Drag & drop image here</h3>
                      <p className="text-base text-muted-foreground font-light">Supports JPG, PNG or WEBP up to 5MB</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-4 w-full">
                    <Button variant="outline" type="button" className="flex-1 h-14 rounded-full border-transparent bg-muted/50 hover:bg-muted text-foreground font-medium text-base shadow-sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      <UploadCloud className="mr-2 h-5 w-5 text-primary" strokeWidth={1.5} /> Browse
                    </Button>
                    <Button variant="outline" type="button" className="flex-1 h-14 rounded-full border-transparent bg-muted/50 hover:bg-muted text-foreground font-medium text-base shadow-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Camera className="mr-2 h-5 w-5 text-primary" strokeWidth={1.5} /> Camera
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full h-16 text-lg rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98] bg-foreground hover:bg-foreground/90 text-background font-medium" 
                  disabled={!file || analyzing}
                  onClick={handleAnalyze}
                >
                  {analyzing ? 'Processing Analysis...' : 'Run Diagnostics'}
                </Button>
                
                <AnimatePresence>
                  {analyzing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      <div className="flex justify-between text-base font-medium text-muted-foreground">
                        <span className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.5} /> Neural network processing</span>
                        <span className="font-mono">{progress}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-[20px]">
                    <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </TabsContent>
              
              <TabsContent value="voice" className="space-y-8">
                <div className={cn(
                  "border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[360px]",
                  speech.status === 'listening' ? 'border-rose-300 bg-rose-50/30' : 'border-border bg-white',
                  voiceAnalyzing && 'opacity-50 pointer-events-none'
                )}>
                  {!speech.isSupported ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <div className="bg-muted p-5 rounded-full w-24 h-24 flex items-center justify-center">
                        <MicOff className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Voice Input Unavailable</h3>
                      <p className="text-base text-muted-foreground font-light max-w-sm">Voice input is not supported on this device. Please use Chrome or Edge.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mic Button — Push to Talk */}
                      <div className="relative mb-8">
                        {speech.status === 'listening' && (
                          <>
                            <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-2xl animate-pulse" />
                            <div className="absolute -inset-4 border-2 border-rose-300/50 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                          </>
                        )}
                        <button
                          id="voice-mic-btn"
                          type="button"
                          aria-label={speech.status === 'listening' ? 'Release to stop recording' : 'Hold to speak'}
                          role="button"
                          disabled={voiceAnalyzing || analyzing}
                          onMouseDown={handleMicDown}
                          onMouseUp={handleMicUp}
                          onMouseLeave={handleMicUp}
                          onTouchStart={(e) => { e.preventDefault(); handleMicDown(); }}
                          onTouchEnd={(e) => { e.preventDefault(); handleMicUp(); }}
                          className={cn(
                            'w-28 h-28 rounded-full flex items-center justify-center relative z-10 transition-all duration-200 select-none touch-none',
                            speech.status === 'listening'
                              ? 'bg-rose-500 shadow-[0_8px_40px_rgba(244,63,94,0.35)] scale-110'
                              : 'bg-white border border-border shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:scale-105 active:scale-110',
                            (voiceAnalyzing || analyzing) && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <Mic
                            className={cn(
                              'h-12 w-12 transition-colors',
                              speech.status === 'listening' ? 'text-white' : 'text-primary'
                            )}
                            strokeWidth={speech.status === 'listening' ? 2 : 1}
                          />
                        </button>
                      </div>

                      <h3 className="text-3xl font-semibold text-foreground mb-2">
                        {speech.status === 'listening' ? 'Listening...' : speech.status === 'processing' ? 'Processing...' : 'Hold to Speak'}
                      </h3>
                      <p className="text-lg text-muted-foreground max-w-sm font-light leading-relaxed">
                        {speech.status === 'listening'
                          ? 'Release when you\'re done speaking.'
                          : 'Describe the symptoms you see on your crops in your local language.'}
                      </p>

                      {/* Live transcript preview */}
                      {(speech.interimTranscript || (speech.status === 'listening' && speech.transcript)) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-w-md">
                          <div className="bg-muted/30 border border-border/50 rounded-[20px] p-5 text-base text-foreground font-light italic">
                            "{speech.transcript || ''}{speech.interimTranscript}"
                          </div>
                        </motion.div>
                      )}

                      {/* Show finalized transcript */}
                      {voiceTranscript && !speech.interimTranscript && speech.status !== 'listening' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-w-md">
                          <div className="bg-green-50 border border-green-200/50 rounded-[20px] p-5 text-base text-green-800 font-medium">
                            "{voiceTranscript}"
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Voice progress bar */}
                <AnimatePresence>
                  {voiceAnalyzing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      <div className="flex justify-between text-base font-medium text-muted-foreground">
                        <span className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.5} /> Analyzing symptoms</span>
                        <span className="font-mono">{voiceProgress}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${voiceProgress}%` }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {voiceError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-[20px]">
                    <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{voiceError}</span>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Column */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {!(result || voiceResult) ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <Card className="h-full flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-border bg-transparent shadow-none rounded-[32px]">
                  <div className="bg-muted p-8 rounded-full mb-8">
                    <Scan className="h-16 w-16 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Awaiting Analysis</h3>
                  <p className="text-lg text-muted-foreground max-w-sm font-light leading-relaxed">
                    Upload an image on the left to receive an AI-powered diagnostic report.
                  </p>
                </Card>
              </motion.div>
            ) : (() => {
              const displayResult = result || voiceResult;
              return (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
                <Card className="glass-card overflow-hidden relative h-full flex flex-col">
                  <div className={`absolute top-0 left-0 w-full h-3 ${getSeverityColor(displayResult.severity)}`} />
                  
                  <CardHeader className="pb-8 relative z-10 px-8 pt-10">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-widest">
                          Diagnostic Report
                        </div>
                        <CardTitle className="text-4xl font-semibold capitalize text-foreground mb-4">
                          {displayResult.disease}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-4 bg-white border border-border px-4 py-2 rounded-full w-fit">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Severity:</span>
                          <span className="flex items-center gap-2 font-semibold uppercase tracking-widest text-sm text-foreground">
                            {getSeverityIcon(displayResult.severity)} {displayResult.severity}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white border border-border p-5 rounded-[24px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] min-w-[100px]">
                        <div className="text-4xl font-light text-foreground">{displayResult.confidence}<span className="text-xl text-muted-foreground font-light">%</span></div>
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-2">Match</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-10 flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
                    {/* Symptoms */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-orange-500" strokeWidth={1.5} /> Identified Symptoms
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayResult.symptoms.map((s: string, i: number) => (
                          <div key={i} className="bg-white border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 rounded-[20px] text-base font-light text-foreground flex items-start gap-3">
                            <span className="text-orange-500 mt-1 shrink-0">•</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Treatment */}
                    <div className="bg-green-50/50 p-8 rounded-[24px] border border-transparent">
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-green-700 mb-6 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} /> Recommended Protocol
                      </h4>
                      <ul className="space-y-4">
                        {displayResult.treatment.map((t: string, i: number) => (
                          <li key={i} className="text-base font-light text-foreground flex items-start gap-4 leading-relaxed">
                            <span className="text-green-600 mt-1 shrink-0 bg-green-100 p-1.5 rounded-full"><Leaf className="h-4 w-4" strokeWidth={1.5} /></span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-3">
                        <FileWarning className="h-5 w-5 text-blue-500" strokeWidth={1.5} /> Prevention Measures
                      </h4>
                      <ul className="space-y-4">
                        {displayResult.prevention.map((p: string, i: number) => (
                          <li key={i} className="text-base text-foreground font-light flex items-start gap-4 bg-white border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 rounded-[20px]">
                            <span className="text-blue-500 mt-1 shrink-0">•</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  
                  {displayResult.severity.toLowerCase() === 'high' && (
                    <div className="p-8 border-t border-border/50 bg-muted/20">
                      <Button className="w-full h-16 text-lg font-medium rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_8px_30px_rgba(239,68,68,0.2)] border-0 active:scale-[0.98] transition-transform">
                        <AlertOctagon className="mr-3 h-6 w-6" strokeWidth={1.5} /> Contact Agronomy Expert Now
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
