import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-heading-1 font-bold leading-tight">
                Objavi više.{' '}
                <span className="gradient-primary bg-clip-text text-transparent">
                  Prodaj brže.
                </span>
              </h1>
              
              <p className="text-text-muted text-lg lg:text-xl leading-relaxed max-w-xl">
                Pretvori fotografije i osnovne podatke iz oglasa u vertikalne reel videe 9:16 
                sa vizuelnim i glasovnim hook-om, muzikom i titlovima — spremno za 
                Instagram/TikTok/Facebook za par minuta.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button asChild size="lg" className="gradient-primary hover-lift">
                <Link to="/app/login">
                  Započni rani pristup
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className="group p-0 h-auto text-base">
                <a href="#demo" className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-text-primary hover:text-primary transition-colors">
                    Pogledaj kratki demo
                  </span>
                </a>
              </Button>
            </div>
          </div>
          
          {/* Right Column - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-64 h-[520px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                  
                  {/* Video Content Area */}
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center relative">
                    {/* Placeholder Video Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                          <Play className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Luksuzni Stan</h3>
                        <p className="text-sm opacity-90">Centar Beograda</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-sm font-medium">€850/mesec</p>
                          <p className="text-xs opacity-75">60m² • 2 sobe • 1 kupatilo</p>
                        </div>
                        
                        {/* Bottom UI Elements */}
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-xs">♡</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-xs">💬</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-xs">📤</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs">📖</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Loading Animation */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl -z-10 scale-110"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portal Strip */}
      <div className="mt-20 lg:mt-32 border-t border-border/50">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-text-muted text-sm font-medium">
            Radi uz portale koje već koristiš
          </p>
          
          {/* Portal Logos Placeholder */}
          <div className="flex justify-center items-center space-x-8 mt-6 opacity-40">
            {['4zida', 'Halo Oglasi', 'CityExpert', 'Nekretnine.rs', 'Sasomange'].map((portal, index) => (
              <div key={index} className="text-text-subtle text-sm font-medium">
                {portal}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}