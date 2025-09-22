import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/">← Nazad na početnu</Link>
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Uslovi korišćenja</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Prihvatanje uslova</h2>
            <p className="mb-4">
              Korišćenjem Reel Estate platforme, prihvatate ove uslove korišćenja u potpunosti.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Opis usluge</h2>
            <p className="mb-4">
              Reel Estate je platforma za kreiranje AI-generisanih video prezentacija nekretnina.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Korisnički sadržaj</h2>
            <p className="mb-4">
              Vi zadržavate prava na sadržaj koji učitavate, ali nam dajete licencu za obradu radi pružanja usluge.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Zabrane korišćenja</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Učitavanje neprikladnog ili nezakonitog sadržaja</li>
              <li>Zloupotreба platforme za spam ili maliciozne aktivnosti</li>
              <li>Pokušaj hakovanja ili narušavanja bezbednosti</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Kontakt</h2>
            <p>
              Za pitanja o ovim uslovima, kontaktirajte nas na: legal@reelestate.rs
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}