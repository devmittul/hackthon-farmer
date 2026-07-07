import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Sprout, Droplets, Stethoscope, 
  TrendingUp, ShieldCheck, Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden flex items-center justify-center min-h-[90vh]">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-50 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-50 blur-[150px] rounded-full pointer-events-none" />

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-green-700 mb-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 mr-3 animate-pulse" />
              KrishiMitra AI 2.0 is now live
              <ChevronRight className="ml-2 h-4 w-4 text-green-400" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-5xl md:text-8xl font-semibold tracking-tight text-foreground max-w-5xl mx-auto mb-10 leading-[1.05]">
              The Intelligence Layer for <br className="hidden md:block" />
              <span className="text-green-700">Modern Agriculture</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto mb-14 leading-relaxed">
              Empower your farm with real-time satellite insights, AI-driven disease diagnosis, and hyper-local weather forecasting. Built for scale, designed for simplicity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full">
              <Button size="lg" asChild className="rounded-full px-10 h-16 text-lg font-medium bg-foreground hover:bg-foreground/90 text-background shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]">
                <Link to="/register">
                  Start Building <ArrowRight className="ml-3 h-5 w-5" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-medium border-transparent bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-muted text-foreground transition-all">
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 border-y border-border/50 bg-white/50 backdrop-blur-3xl">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center divide-x divide-border/50">
            {[
              { value: "50,000+", label: "Active Farmers" },
              { value: "1.2M", label: "Acres Monitored" },
              { value: "98.5%", label: "Prediction Accuracy" },
              { value: "30%", label: "Resource Optimization" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center px-4"
              >
                <div className="text-4xl md:text-6xl font-light tracking-tight text-foreground mb-3">{stat.value}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-32 container px-4 relative">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-semibold mb-8 tracking-tight text-foreground">A complete platform</h2>
          <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed">Everything you need to optimize your agricultural workflow, integrated into a single powerful dashboard.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Sprout className="h-8 w-8 text-green-700" strokeWidth={1.5} />,
              color: "bg-green-100/80",
              title: "Machine Learning Yields",
              desc: "Deploy proprietary ML models to predict crop success rates based on hyperspectral soil data and climatic patterns."
            },
            {
              icon: <Droplets className="h-8 w-8 text-blue-700" strokeWidth={1.5} />,
              color: "bg-blue-100/80",
              title: "Precision Irrigation",
              desc: "Automate watering schedules with predictive algorithms integrating real-time evapotranspiration APIs."
            },
            {
              icon: <Stethoscope className="h-8 w-8 text-purple-700" strokeWidth={1.5} />,
              color: "bg-purple-100/80",
              title: "Computer Vision Diagnostics",
              desc: "Instantly classify foliar diseases using our cloud-based neural networks with zero latency."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full glass-card border-0 rounded-[32px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500">
                <CardContent className="p-10">
                  <div className={`mb-8 p-4 rounded-full ${feature.color} inline-flex transition-transform duration-500 hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground font-light text-lg leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-40 bg-white border-y border-border/50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-700 mb-8 uppercase tracking-widest">
                Built for Performance
              </div>
              <h2 className="text-4xl md:text-6xl font-semibold mb-8 tracking-tight text-foreground leading-[1.1]">
                Engineered for the <br /> modern ecosystem.
              </h2>
              <p className="text-lg md:text-xl font-light text-muted-foreground mb-12 leading-relaxed">
                Experience lightning-fast insights with our edge-optimized infrastructure. We process complex agricultural metrics locally to deliver results before you even realize you need them.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: TrendingUp, text: "Advanced Data Visualization", sub: "Interactive charts powered by Recharts." },
                  { icon: ShieldCheck, text: "Enterprise-grade Security", sub: "Your farm data is encrypted at rest." },
                  { icon: Zap, text: "Real-time Processing", sub: "Instant AI inference on the edge." },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="mt-1 bg-muted p-3 rounded-full">
                      <benefit.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-foreground">{benefit.text}</h4>
                      <p className="text-base font-light text-muted-foreground mt-2">{benefit.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Abstract visual representation of a dashboard */}
            <div className="relative h-[600px] w-full rounded-[40px] bg-muted/30 p-8 overflow-hidden border border-transparent shadow-sm">
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-12 w-72 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="h-5 w-28 bg-green-100 rounded-full mb-6" />
                <div className="flex gap-4">
                  <div className="h-14 w-14 bg-green-100 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-3 w-full bg-muted rounded-full" />
                    <div className="h-3 w-2/3 bg-muted rounded-full" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-12 w-80 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="h-5 w-24 bg-blue-100 rounded-full" />
                  <div className="h-5 w-5 rounded-full bg-blue-100" />
                </div>
                <div className="flex items-end gap-3 h-28 mt-4">
                  {[40, 70, 45, 90, 65, 85].map((h, i) => (
                    <div key={i} className="w-full bg-blue-100 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40">
        <div className="container px-4 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-6">
            <AccordionItem value="item-1" className="bg-white px-8 py-2 rounded-[24px] border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] data-[state=open]:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
              <AccordionTrigger className="hover:no-underline text-xl font-semibold py-6 text-foreground">Is the platform free to use?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light text-lg pb-6 leading-relaxed">
                Yes, the core intelligence layer of KrishiMitra AI is completely free for individual farmers. We believe in democratizing access to enterprise-grade agricultural tools.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-white px-8 py-2 rounded-[24px] border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] data-[state=open]:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
              <AccordionTrigger className="hover:no-underline text-xl font-semibold py-6 text-foreground">How accurate are the AI models?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light text-lg pb-6 leading-relaxed">
                Our models are trained on millions of data points from Google Earth Engine and Open-Meteo, achieving over 95% accuracy in crop recommendation and disease diagnosis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-white px-8 py-2 rounded-[24px] border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] data-[state=open]:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
              <AccordionTrigger className="hover:no-underline text-xl font-semibold py-6 text-foreground">Can I integrate via API?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light text-lg pb-6 leading-relaxed">
                Yes, our developer API allows seamless integration of our ML predictions and weather routing directly into your own applications or hardware endpoints.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
