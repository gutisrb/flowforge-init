import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden py-20 lg:py-32">
      {/* TODO: HERO_BG_PLACEHOLDER (wide, blurred) */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Text Content */}
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
          
          {/* Right Column - Image Placeholder */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/3] bg-muted rounded-xl border-2 border-border/50 overflow-hidden shadow-lg">
              {/* TODO: HERO_IMAGE_PLACEHOLDER */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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