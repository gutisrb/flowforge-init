import { HeroSection } from '@/components/HeroSection';
import { FeatureModal } from '@/components/FeatureModal';
import { StickyButton } from '@/components/StickyButton';
import { ReelPreviewModal } from '@/components/ReelPreviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Zap, Type, Music, Shuffle, Sparkles, FolderOpen } from 'lucide-react';
export default function Home() {
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Sticky Button */}
      <StickyButton />

      {/* How it Works Section */}
      <section id="kako" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kako funkcioniše</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Step 1 */}
            <Card className="text-center p-6 hover-lift">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  1
                </div>
                {/* TODO: ICON_STEP1 */}
                <CardTitle className="text-lg font-semibold mb-3">
                  Dodaj detalje i fotografije
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Unesite cenu, lokaciju i ključne podatke – dodajte jednu ili dve fotografije nekretnine.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center p-6 hover-lift">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  2
                </div>
                {/* TODO: ICON_STEP2 */}
                <CardTitle className="text-lg font-semibold mb-3">
                  AI video za mreže
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Reel Studio automatski pravi 9:16 video sa kretanjem kamere i tranzicijom između dve fotke.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center p-6 hover-lift">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  3
                </div>
                {/* TODO: ICON_STEP3 */}
                <CardTitle className="text-lg font-semibold mb-3">
                  Glas, muzika i titlovi
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Generiše se glasovni narator na srpskom, bira se muzika i dodaju animirani titlovi i opis objave.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center p-6 hover-lift">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  4
                </div>
                {/* TODO: ICON_STEP4 */}
                <CardTitle className="text-lg font-semibold mb-3">
                  Preuzmi ili objavi
                </CardTitle>
                <p className="text-muted-foreground text-sm">
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

      <section id="zasto" className="container mx-auto px-4 py-20 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Zašto radi</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg font-medium">
                Dodatni domet, preko portala.
              </p>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg font-medium">
                Doslednost bez zapošljavanja — 30 objava mesečno.
              </p>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg font-medium">
                Podešeno za algoritme: 9:16, rani hook, titlovi, balansirana muzika.
              </p>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-background rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg font-medium">
                Uvek brendirano: vodeni žig i boje agencije u set-upu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="funkcije" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Funkcije</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <FeatureModal icon={<Zap className="h-6 w-6" />} title="Hook u prvim sekundama" description="AI automatski kreira privlačan početak videa koji zadržava pažnju gledaoca u prvih 3 sekunde. Koristi se kombinacija dinamičnih prelaza, atraktivnih kadrova i vizuelnih efekata koji odmah privlače pogled na društvenim mrežama." />
          
          <FeatureModal icon={<Type className="h-6 w-6" />} title="Titlovi (gledanje bez zvuka)" description="Automatski generirani titlovi omogućavaju gledanje videa bez zvuka, što je ključno jer većina korisnika na društvenim mrežama gleda sadržaj sa isključenim zvukom. Titlovi su stilizovani i pozicionirani za maksimalnu čitljivost." />
          
          <FeatureModal icon={<Music className="h-6 w-6" />} title="AI muzika u pozadini" description="Pažljivo odabrana pozadinska muzika koja odgovara stilu nekretnine i ciljnoj publici. AI bira melodije koje pojačavaju atmosferu prostora bez ometanja govora ili narušavanja profesionalnog tona prezentacije." />
          
          <FeatureModal icon={<Shuffle className="h-6 w-6" />} title="Frame-to-frame tranzicije" description="Glatki prelazi između fotografija koji kreiraju osećaj kontinuiteta i prirodnog kretanja kroz prostor. AI analizira slike i kreira tranzicije koje naglašavaju najbolje karakteristike svakog kadra." />
          
          <FeatureModal icon={<Sparkles className="h-6 w-6" />} title="AI Furnisher (pre/posle)" description="Virtuelno nameštanje praznih prostora pomoću AI tehnologije. Kreira realistične prikaze kako bi prostor mogao da izgleda kada je namešten, pomoćući klijentima da lakše vizualizuju potencijal nekretnine." />
          
          <FeatureModal icon={<FolderOpen className="h-6 w-6" />} title="Moja biblioteka" description="Centralizovano mesto za čuvanje svih vaših video projekata, fotografija i materijala. Omogućava lakše organizovanje, pretragu i ponovnu upotrebu sadržaja za buduće projekte sa naprednim sistemom tagovanja." />
          
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Od onoga što već imaš → do videa koji se gleda.
          </h2>
          <p className="text-text-muted text-lg">Format prilagođen feedovima.</p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative max-w-sm">
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
                      <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
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
      </section>

      {/* Pricing Section */}
      <section id="cena" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Cena</h2>
        <div className="flex justify-center">
          <Card className="max-w-md w-full border-2 border-primary/20 shadow-lg hover-lift">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Rani pristup (Srbija)
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">€99</span>
                <span className="text-text-muted">/mesec</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>Do 30 reel-ova mesečno</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>AI video: scenario, voice, muzika</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>Frame-to-frame tranzicije</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>AI Furnisher (pre/posle)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>Moja biblioteka</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  <span>Vodeni žig / logo u set-upu</span>
                </li>
              </ul>
              
              <div className="text-center">
                <p className="text-sm text-text-muted mb-4">
                  Osnivačke agencije: –30% prva 3 meseca.
                </p>
                <Button asChild size="lg" className="w-full gradient-primary">
                  <Link to="/app/login">Rezerviši mesto</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="cena" className="container mx-auto px-4 py-20 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Cena</h2>
        <div className="text-center">
          <div className="bg-background rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4">Rani pristup</h3>
            <p className="text-3xl font-bold mb-4">Besplatno</p>
            <p className="text-muted-foreground mb-6">Tokom beta periode</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/app/login">Registruj se</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="container mx-auto px-4 py-20 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Česta pitanja</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-background p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Da li ovo zamenjuje portale?</h3>
            <p className="text-muted-foreground">Ne — društvene mreže dodaju domet.</p>
          </div>
          <div className="bg-background p-6 rounded-xl shadow-sm">
            
            <p className="text-muted-foreground">Ne trenutno; izlaz je automatski iz podataka iz oglasa.</p>
          </div>
          <div className="bg-background p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Garantujete viral?</h3>
            <p className="text-muted-foreground">Ne; format je po best-practice-u (vertikalno, rani hook, titlovi) radi bolje gledanosti.</p>
          </div>
          <div className="bg-background p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Hoće li videi izgledati generički?</h3>
            <p className="text-muted-foreground">Tvoj logo/vodeni žig se dodaje pri set-upu.</p>
          </div>
          <div className="bg-background p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Muzika?</h3>
            <p className="text-muted-foreground">AI instrumentali; ako menjaš zvuk u platformi, koristi njihove komercijalne biblioteke.</p>
          </div>
          <div className="bg-background p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Za koga je?</h3>
            <p className="text-muted-foreground">Agencije koje spajaju vlasnike i kupce/zakupce.</p>
          </div>
        </div>
      </section>
    </div>;
}