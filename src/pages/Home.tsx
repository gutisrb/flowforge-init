import { HeroSection } from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Sections */}
      <section id="kako" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Kako funkcioniše</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">1. Učitajte slike</h3>
            <p className="text-muted-foreground">Dodajte fotografije vašeg prostora</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">2. Opišite viziju</h3>
            <p className="text-muted-foreground">Unesite instrukcije za AI</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">3. Generiši video</h3>
            <p className="text-muted-foreground">AI kreira profesionalnu prezentaciju</p>
          </div>
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