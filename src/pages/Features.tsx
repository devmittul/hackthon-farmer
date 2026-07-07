import { motion } from 'framer-motion';
import { Sprout, Droplet, Stethoscope, CloudSun, Activity, ChevronRight, BarChart } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Sprout className="h-8 w-8 text-green-700" strokeWidth={1.5} />,
      color: "bg-green-100",
      title: "AI Crop Recommendation",
      description: "Our machine learning models analyze soil nutrients (N, P, K), pH levels, and local weather patterns to suggest the optimal crops for your specific farm conditions. Increase yield by growing the right crop at the right time."
    },
    {
      icon: <Droplet className="h-8 w-8 text-blue-700" strokeWidth={1.5} />,
      color: "bg-blue-100",
      title: "Smart Irrigation Advisory",
      description: "Stop guessing when to water. We integrate hyper-local weather forecasting with soil moisture evaporation rates to provide precise watering schedules, conserving water and improving crop health."
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-purple-700" strokeWidth={1.5} />,
      color: "bg-purple-100",
      title: "Computer Vision Diagnosis",
      description: "Simply snap a photo of a sick plant. Our neural networks instantly analyze the leaf pathology to detect diseases, determine severity, and provide actionable treatment and prevention plans."
    },
    {
      icon: <CloudSun className="h-8 w-8 text-orange-700" strokeWidth={1.5} />,
      color: "bg-orange-100",
      title: "Hyper-local Weather",
      description: "Access real-time climatic data and multi-day forecasts for your exact farm coordinates. Plan your harvesting, spraying, and fertilizing around reliable meteorological insights."
    },
    {
      icon: <BarChart className="h-8 w-8 text-indigo-700" strokeWidth={1.5} />,
      color: "bg-indigo-100",
      title: "Market Insights & Reports",
      description: "Stay ahead of the curve with historical analytics and market trend predictions. Export comprehensive PDF reports of your farm's activity to share with agronomists or buyers."
    },
    {
      icon: <Activity className="h-8 w-8 text-rose-700" strokeWidth={1.5} />,
      color: "bg-rose-100",
      title: "Real-time Field Monitoring",
      description: "Connect your IoT sensors directly into the KrishiMitra dashboard. Monitor live soil moisture, ambient temperature, and humidity directly from your phone or laptop."
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background pt-24 pb-40">
      <div className="container px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full bg-green-50 px-5 py-2 text-sm font-semibold text-green-700 mb-8 border border-green-100">
            Platform Capabilities
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-8 leading-[1.1]">
            Everything you need to <br className="hidden md:block" />
            <span className="text-green-700">farm smarter.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            KrishiMitra AI integrates cutting-edge machine learning, computer vision, and IoT data into a single, beautifully simple dashboard designed specifically for modern agriculture.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className="bg-white h-full p-10 rounded-[40px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col group border border-transparent hover:border-green-50">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed text-lg flex-1">
                  {feature.description}
                </p>
                <div className="mt-8 pt-6 border-t border-border/50 flex items-center text-green-700 font-medium group-hover:translate-x-2 transition-transform duration-300 cursor-pointer">
                  Learn more <ChevronRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
