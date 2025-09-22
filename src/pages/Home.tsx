import { HeroSection } from '@/components/HeroSection';
import { FeatureModal } from '@/components/FeatureModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Zap, Type, Music, Shuffle, Sparkles, FolderOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* How it Works Section */}
      <section id="kako" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Kako funkcioniše</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold mb-4">
              Dodaj 5–12 fotografija + cena/m²/lokacija
            </h3>
            <p className="text-muted-foreground">
              Učitaj slike prostora i unesi osnovne podatke o nekretnini
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold mb-4">
              Opcionalno: unesi jednu "Dodatno" rečenicu i poređaj fotografije
            </h3>
            <p className="text-muted-foreground">
              Prilagodi redosled slika i dodaj dodatne informacije
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">
              Generiši → preuzmi MP4 → objavi
            </h3>
            <p className="text-muted-foreground">
              AI kreira video spreman za objavljivanje na društvenim mrežama
            </p>
          </div>
        </div>
        
        {/* Note under the grid */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Izlaz je prilagođen feedovima: 9:16, hook u prvim sekundama, pozadinska muzika, otvoreni titlovi.
          </p>
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
          
          <FeatureModal
            icon={<Zap className="h-6 w-6" />}
            title="Hook u prvim sekundama"
            description="AI automatski kreira privlačan početak videa koji zadržava pažnju gledaoca u prvih 3 sekunde. Koristi se kombinacija dinamičnih prelaza, atraktivnih kadrova i vizuelnih efekata koji odmah privlače pogled na društvenim mrežama."
          />
          
          <FeatureModal
            icon={<Type className="h-6 w-6" />}
            title="Titlovi (gledanje bez zvuka)"
            description="Automatski generirani titlovi omogućavaju gledanje videa bez zvuka, što je ključno jer većina korisnika na društvenim mrežama gleda sadržaj sa isključenim zvukom. Titlovi su stilizovani i pozicionirani za maksimalnu čitljivost."
          />
          
          <FeatureModal
            icon={<Music className="h-6 w-6" />}
            title="AI muzika u pozadini"
            description="Pažljivo odabrana pozadinska muzika koja odgovara stilu nekretnine i ciljnoj publici. AI bira melodije koje pojačavaju atmosferu prostora bez ometanja govora ili narušavanja profesionalnog tona prezentacije."
          />
          
          <FeatureModal
            icon={<Shuffle className="h-6 w-6" />}
            title="Frame-to-frame tranzicije"
            description="Glatki prelazi između fotografija koji kreiraju osećaj kontinuiteta i prirodnog kretanja kroz prostor. AI analizira slike i kreira tranzicije koje naglašavaju najbolje karakteristike svakog kadra."
          />
          
          <FeatureModal
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Furnisher (pre/posle)"
            description="Virtuelno nameštanje praznih prostora pomoću AI tehnologije. Kreira realistične prikaze kako bi prostor mogao da izgleda kada je namešten, pomoćući klijentima da lakše vizualizuju potencijal nekretnine."
          />
          
          <FeatureModal
            icon={<FolderOpen className="h-6 w-6" />}
            title="Moja biblioteka"
            description="Centralizovano mesto za čuvanje svih vaših video projekata, fotografija i materijala. Omogućava lakše organizovanje, pretragu i ponovnu upotrebu sadržaja za buduće projekte sa naprednim sistemom tagovanja."
          />
          
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

      <section id="faq" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Česta pitanja</h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Da li je besplatno?</h3>
            <p className="text-muted-foreground">Da, tokom beta periode pristup je potpuno besplatan.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Koje formate podržavate?</h3>
            <p className="text-muted-foreground">Podržavamo PNG, JPG i WEBP formatu slika.</p>
          </div>
        </div>
      </section>
    </div>
  );
}