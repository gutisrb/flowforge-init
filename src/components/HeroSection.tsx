import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';

// Injects the necessary CSS keyframes for the animated background.
const BackgroundStyles = () => (
  <style>
    {`
      @keyframes move-bg {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animated-gradient-bg {
        background: radial-gradient(circle at 20% 20%, #06b6d4, transparent 40%),
                    radial-gradient(circle at 80% 30%, #3B82F6, transparent 40%),
                    radial-gradient(circle at 50% 80%, #8B5CF6, transparent 40%),
                    #111827; /* A dark gray instead of pure black for a softer look */
        background-size: 300% 300%;
        animation: move-bg 20s ease-in-out infinite;
        opacity: 0.2; /* Kept it subtle */
      }
    `}
  </style>
);


export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden py-20 lg:py-32 bg-background">
      {/* Animated Background using your logo's colors */}
      <BackgroundStyles />
      <div className="absolute inset-0 animated-gradient-bg"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Text Content (Your original content) */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-heading-1 font-bold leading-tight text-foreground">
                Više pregleda. Više upita.{' '}
                <span className="text-primary">
                  AI studio za video i slike – za agente nekretnina.
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-xl">
                Napravite profesionalne reel-videe i vizuale iz par fotografija i osnovnih detalja – bez editovanja i bez snimatelja.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button asChild size="lg" className="gradient-primary hover-lift">
                <a 
                  href="#kako" 
                  aria-label="Pogledaj kako radi AI studio"
                  className="scroll-smooth"
                >
                  Pogledaj kako radi
                  <ArrowRight className="h-5 w-5 ml-2" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="hover-lift"
                aria-label="Zatraži pristup ranom testiranju"
                onClick={() => {
                  // TODO: CTA_FORM_PLACEHOLDER modal
                  console.log('Open early access form modal');
                }}
              >
                Zatraži rani pristup
              </Button>
            </div>
          </div>
          
          {/* Right Column - Image Placeholder (Your original content) */}
          <div className="relative flex justify-center lg:justify-end">
             <div 
                className="relative w-full max-w-md aspect-[4/3] bg-muted/50 rounded-xl border-2 border-border/50 overflow-hidden shadow-lg backdrop-blur-sm"
             >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI Studio Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

