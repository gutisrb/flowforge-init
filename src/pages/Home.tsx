import { HeroSection } from '@/components/HeroSection';
import { FeatureModal } from '@/components/FeatureModal';
import { StickyButton } from '@/components/StickyButton';
import { ReelPreviewModal } from '@/components/ReelPreviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Zap, Type, Music, Shuffle, Sparkles, FolderOpen } from 'lucide-react';
import { MeshGradient } from "@paper-design/shaders-react";

export default function Home() {
  return <div className="min-h-screen relative">
      {/* Global Shader Background */}
      <div className="fixed inset-0 -z-10">
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
          speed={0.2}
        />
        <MeshGradient
          className="absolute inset-0 w-full h-full opacity-40"
          colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
          speed={0.15}
        />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Sticky Button */}
      <StickyButton />

      {/* How it Works Section - White Overlay */}
      <section id="kako" className="relative py-20" aria-labelledby="kako-heading">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="kako-heading" className="text-heading-2 text-center mb-12">Kako funkcioniše</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Step 1 */}
            <Card className="text-center p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Korak 1: Dodaj detalje i fotografije">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4" aria-hidden="true">
                  1
                </div>
                {/* TODO: ICON_STEP1 */}
                <CardTitle className="text-heading-3 mb-3">
                  Dodaj detalje i fotografije
                </CardTitle>
                <p className="text-muted-foreground text-body-sm">
                  Unesite cenu, lokaciju i ključne podatke – dodajte jednu ili dve fotografije nekretnine.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Korak 2: AI video za mreže">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4" aria-hidden="true">
                  2
                </div>
                {/* TODO: ICON_STEP2 */}
                <CardTitle className="text-heading-3 mb-3">
                  AI video za mreže
                </CardTitle>
                <p className="text-muted-foreground text-body-sm">
                  Reel Studio automatski pravi 9:16 video sa kretanjem kamere i tranzicijom između dve fotke.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Korak 3: Glas, muzika i titlovi">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4" aria-hidden="true">
                  3
                </div>
                {/* TODO: ICON_STEP3 */}
                <CardTitle className="text-heading-3 mb-3">
                  Glas, muzika i titlovi
                </CardTitle>
                <p className="text-muted-foreground text-body-sm">
                  Generiše se glasovni narator na srpskom, bira se muzika i dodaju animirani titlovi i opis objave.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Korak 4: Preuzmi ili objavi">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4" aria-hidden="true">
                  4
                </div>
                {/* TODO: ICON_STEP4 */}
                <CardTitle className="text-heading-3 mb-3">
                  Preuzmi ili objavi
                </CardTitle>
                <p className="text-muted-foreground text-body-sm">
                  Preuzmite video ili ga direktno objavite na povezane profile (kada je povezivanje aktivirano).
                </p>
              </CardContent>
            </Card>
            
          </div>

          {/* Mini-demo under the grid */}
          <div className="mt-12 text-center">
            <ReelPreviewModal />
          </div>
        </div>
      </section>

      {/* Why It Works Section - Semi-transparent Background */}
      <section id="zasto" className="relative py-20" aria-labelledby="zasto-heading">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="zasto-heading" className="text-heading-2 text-center mb-12 text-white">Zašto ovo radi</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Veći domet i zadržavanje pažnje">
                <CardContent className="p-0">
                  {/* TODO: BENEFIT_ICON_1 */}
                  <h3 className="text-heading-3 mb-3 text-text-primary">
                    Veći domet i zadržavanje pažnje
                  </h3>
                  <p className="text-text-muted text-body-sm">
                    Vertical 9:16 format, kretanje kamere i kratke priče zaustavljaju skrol i povećavaju gledanost.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Doslednost bez angažovanja ekipe">
                <CardContent className="p-0">
                  {/* TODO: BENEFIT_ICON_2 */}
                  <h3 className="text-heading-3 mb-3 text-text-primary">
                    Doslednost bez angažovanja ekipe
                  </h3>
                  <p className="text-text-muted text-body-sm">
                    Umesto dana editovanja – gotov video za par minuta, spreman za objavu.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Prirodni glas i jasna poruka">
                <CardContent className="p-0">
                  {/* TODO: BENEFIT_ICON_3 */}
                  <h3 className="text-heading-3 mb-3 text-text-primary">
                    Prirodni glas i jasna poruka
                  </h3>
                  <p className="text-text-muted text-body-sm">
                    Narator na srpskom + animirani titlovi za gledanje bez zvuka.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Kreativni vizuali (AI Nameštanje)">
                <CardContent className="p-0">
                  {/* TODO: BENEFIT_ICON_4 */}
                  <h3 className="text-heading-3 mb-3 text-text-primary">
                    Kreativni vizuali (AI Nameštanje)
                  </h3>
                  <p className="text-text-muted text-body-sm">
                    Pre/posle, virtuelno nameštanje, 'magija' tranzicija – sadržaj koji se pamti.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - White Overlay */}
      <section id="funkcije" className="relative py-20" aria-labelledby="funkcije-heading">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="funkcije-heading" className="text-heading-2 text-center mb-12">Funkcije</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="AI generacija video-reelova">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_1 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">AI generacija video-reelova</h3>
                <p className="text-text-muted text-body-sm">Automatska kreacija profesionalnih video reelova optimizovanih za društvene mreže.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Dinamična kamera i tranzicije">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_2 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Dinamična kamera i tranzicije</h3>
                <p className="text-text-muted text-body-sm">Glatki prelazi i kretanje kamere koje zadržava pažnju gledalaca.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Glasovni narator na srpskom">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_3 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Glasovni narator na srpskom</h3>
                <p className="text-text-muted text-body-sm">Prirodni glas koji opisuje nekretninu na lokalnom jeziku.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Automatski titlovi i opis objave">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_4 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Automatski titlovi i opis objave</h3>
                <p className="text-text-muted text-body-sm">Generirani titlovi za gledanje bez zvuka i optimizovane objave.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Muzika optimizovana za mreže">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_5 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Muzika optimizovana za mreže</h3>
                <p className="text-text-muted text-body-sm">Pažljivo odabrana pozadinska muzika koja pojačava prezentaciju.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Virtuelno nameštanje i uređivanje slika">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_6 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Virtuelno nameštanje i uređivanje slika</h3>
                <p className="text-text-muted text-body-sm">AI tehnologija za kreiranje pre/posle vizuala praznih prostora.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Format 9:16, spreman za Instagram/TikTok">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_7 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Format 9:16, spreman za Instagram/TikTok</h3>
                <p className="text-text-muted text-body-sm">Optimizovano za mobilne uređaje i algoritme društvenih mreža.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover-lift focus-ring" tabIndex={0} role="article" aria-label="Preuzimanje ili direktno objavljivanje">
              <CardContent className="p-0">
                {/* TODO: FEATURE_ICON_8 */}
                <h3 className="text-heading-3 mb-3 text-text-primary">Preuzimanje ili direktno objavljivanje*</h3>
                <p className="text-text-muted text-body-sm">Fleksibilne opcije distribucije gotovog sadržaja.</p>
              </CardContent>
            </Card>
            
          </div>
          
          {/* Tip Box */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h4 className="text-heading-3 mb-3 text-primary">💡 Saveti za hook</h4>
                <p className="text-text-muted text-body-sm">
                  Pre/posle, lik u kadru, neočekivani objekat – elementi koji zaustavljaju skrol u prvim sekundama.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-text-subtle text-body-sm mt-6">
            *Direktno objavljivanje dostupno nakon povezivanja naloga. (Bez integracije u ovoj verziji stranice.)
          </p>
        </div>
      </section>

      {/* Demo Section - Semi-transparent Background */}
      <section id="demo" className="relative py-20" aria-labelledby="demo-heading">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 id="demo-heading" className="text-heading-2 mb-4 text-white">
              Od onoga što već imaš → do videa koji se gleda.
            </h2>
            <p className="text-white/80 text-body">Format prilagođen feedovima.</p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative max-w-sm" role="img" aria-label="Prikaz video reel-a na mobilnom telefonu">
              {/* TODO: DEMO_VIDEO_PLACEHOLDER */}
              {/* Phone Frame */}
              <div className="relative w-64 h-[520px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                  
                  {/* Video Placeholder */}
                  <div className="w-full h-full bg-gradient-primary relative overflow-hidden">
                    
                    {/* Placeholder Video Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                      
                      {/* Top content */}
                      <div className="flex justify-between items-start pt-6">
                        <div className="text-left">
                          <div className="text-xs opacity-75 mb-1">@realestateagency</div>
                          <div className="text-sm font-medium">Novi stan u centru</div>
                        </div>
                        <div className="text-xs opacity-75">20s</div>
                      </div>
                      
                      {/* Center play indicator */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center" aria-label="Play dugme">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                      
                      {/* Bottom content - Captions */}
                      <div className="space-y-3">
                        <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
                          <p className="text-sm font-medium">€750/mesec • 55m²</p>
                        </div>
                        
                        <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
                          <p className="text-xs">2 sobe • 1 kupatilo • 3. sprat</p>
                        </div>
                        
                        <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
                          <p className="text-xs">Knez Mihailova, centar Beograda</p>
                        </div>
                        
                        {/* Social media UI */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex space-x-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-sm">♡</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-sm">💬</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="text-sm">📤</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm">📖</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated progress bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl -z-10 scale-110"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Gradient Overlay */}
      <section id="cena" className="relative py-20" aria-labelledby="cena-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-orange-900/40 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="cena-heading" className="text-heading-2 text-center mb-12 text-white">Cena</h2>
          <div className="text-center">
            <Card className="bg-background p-8 max-w-md mx-auto hover-lift focus-ring border-2 border-primary/20" tabIndex={0} role="article" aria-label="Plan cene za ranu registraciju">
              <CardContent className="p-0">
                <h3 className="text-heading-2 mb-4 text-primary">Rani pristup</h3>
                <div className="mb-6">
                  <span className="text-heading-1 text-text-primary">Besplatno</span>
                  <p className="text-muted-foreground text-body-sm mt-2">Tokom beta periode</p>
                </div>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90 focus-ring text-primary-foreground" 
                  aria-label="Registrujte se za besplatan pristup"
                >
                  <Link to="/app/login">Registruj se</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - White Overlay */}
      <section id="faq" className="relative py-20" aria-labelledby="faq-heading">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="faq-heading" className="text-heading-2 text-center mb-12">Česta pitanja</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-2" aria-label="Česta pitanja o Reel Studio">
              <AccordionItem value="item-1" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline focus-ring text-left">
                  Da li zamenjujete oglasne portale?
                </AccordionTrigger>
                <AccordionContent className="text-text-muted text-body-sm">
                  Ne. Reel Studio i AI Nameštanje dopunjuju portale – pravimo sadržaj za mreže kako biste došli do dodatnih kupaca.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline focus-ring text-left">
                  Šta mi je potrebno da napravim prvi video?
                </AccordionTrigger>
                <AccordionContent className="text-text-muted text-body-sm">
                  Osnovne informacije o listingu i jedna ili dve fotografije. Aplikacija radi ostalo.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline focus-ring text-left">
                  Da li glas zvuči prirodno?
                </AccordionTrigger>
                <AccordionContent className="text-text-muted text-body-sm">
                  Da – generiše se naracija na srpskom, prilagođena formatu reela i titlovima.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline focus-ring text-left">
                  Mogu li da uradim pre/posle video?
                </AccordionTrigger>
                <AccordionContent className="text-text-muted text-body-sm">
                  Da. Učitajte početnu i završnu sliku (npr. prazna vs nameštena soba) i dobićete tranziciju između njih.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline focus-ring text-left">
                  Da li mogu direktno da objavljujem?
                </AccordionTrigger>
                <AccordionContent className="text-text-muted text-body-sm">
                  Možete preuzeti video ili, nakon povezivanja naloga, objaviti na mreže direktno iz panela.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>;
}