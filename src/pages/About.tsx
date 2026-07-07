import { motion } from 'framer-motion';
import { Sprout, Users, Globe, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background pt-24 pb-40">
      <div className="container px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 mb-8 border border-blue-100">
            Our Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-8 leading-[1.1]">
            Democratizing <br className="hidden md:block" />
            <span className="text-blue-700">agricultural intelligence.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            We believe that every farmer, regardless of the size of their plot, deserves access to enterprise-grade agronomy tools.
          </p>
        </motion.div>

        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">The Story</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                KrishiMitra AI started as a hackathon project with a simple premise: what if smallholder farmers could access the same predictive models used by massive commercial agribusinesses?
              </p>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                By leveraging edge AI, computer vision, and satellite APIs, we've built a platform that translates complex data into simple, actionable insights. We're removing the guesswork from farming.
              </p>
            </div>
            <div className="relative h-[400px] rounded-[32px] overflow-hidden bg-muted/50 border border-border/50 flex items-center justify-center">
              <Sprout className="h-32 w-32 text-blue-200" strokeWidth={1} />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 to-transparent mix-blend-overlay" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="h-8 w-8 text-indigo-700" strokeWidth={1.5} />,
              color: "bg-indigo-100",
              title: "Farmer First",
              desc: "Designed ground-up for ease of use in rural conditions, with multi-language support."
            },
            {
              icon: <Globe className="h-8 w-8 text-teal-700" strokeWidth={1.5} />,
              color: "bg-teal-100",
              title: "Hyper-Local",
              desc: "Recommendations tailored specifically to your micro-climate and exact soil profile."
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-rose-700" strokeWidth={1.5} />,
              color: "bg-rose-100",
              title: "Data Privacy",
              desc: "Your farm data belongs to you. We never sell your yield data to third parties."
            }
          ].map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white p-10 rounded-[32px] text-center shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className={`mx-auto ${val.color} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
                {val.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{val.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
