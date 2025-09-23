import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';
import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden min-h-screen bg-black">
      {/* Shader Background */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
        speed={0.2}
      />
      
      <div className="container mx-auto px-6 relative z-10 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column - Text Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Više pregleda. Više upita.{' '}
                <motion.span 
                  className="text-transparent bg-clip-text"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #f97316 50%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  AI studio za video i slike – za agente nekretnina.
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-white/80 text-lg lg:text-xl leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Napravite profesionalne reel-videe i vizuale iz par fotografija i osnovnih detalja – bez editovanja i bez snimatelja.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-400 text-white border-0 shadow-lg hover:shadow-xl">
                  <a 
                    href="#kako" 
                    aria-label="Pogledaj kako radi AI studio"
                    className="scroll-smooth"
                  >
                    Pogledaj kako radi
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </a>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  aria-label="Zatraži pristup ranom testiranju"
                  onClick={() => {
                    // TODO: CTA_FORM_PLACEHOLDER modal
                    console.log('Open early access form modal');
                  }}
                >
                  Zatraži rani pristup
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Video Preview */}
          <motion.div 
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
             <div 
                className="relative w-full max-w-md aspect-[4/3] bg-white/10 rounded-xl border border-white/20 overflow-hidden shadow-2xl backdrop-blur-sm"
             >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Play className="h-12 w-12 mx-auto mb-2 opacity-80" />
                  </motion.div>
                  <p className="text-sm opacity-80">AI Studio Preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

