import { HeroSection } from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <h2 className="text-3xl font-bold text-center mb-12">Zašto Reel Estate</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Brža prodaja</h3>
            <p className="text-muted-foreground">Ubrzajte proces prodaje uz profesionalne video prezentacije</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Veća vrednost</h3>
            <p className="text-muted-foreground">Povećajte percepciju vrednosti nekretnine</p>
          </div>
        </div>
      </section>

      <section id="funkcije" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Funkcije</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">AI Furnisher</h3>
            <p className="text-muted-foreground">Dodajte nameštaj i dekoracije</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Video Generator</h3>
            <p className="text-muted-foreground">Kreirajte profesionalne video turneje</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Analitika</h3>
            <p className="text-muted-foreground">Pratite performanse vaših listinga</p>
          </div>
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