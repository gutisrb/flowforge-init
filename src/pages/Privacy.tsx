import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/">← Nazad na početnu</Link>
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Politika privatnosti</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Podaci koje prikupljamo</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Email adresa za registraciju</li>
              <li>Slike koje učitavate za obradu</li>
              <li>Tehnički podaci o korišćenju platforme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Kako koristimo podatke</h2>
            <p className="mb-4">
              Vaše podatke koristimo isključivo za:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pružanje AI usluga obrade slika</li>
              <li>Poboljšanje kvaliteta platforme</li>
              <li>Komunikaciju o važnim ažuriranjima</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Deljenje podataka</h2>
            <p className="mb-4">
              Ne prodajemo niti delimo vaše lične podatke sa trećim stranama, osim u slučajevima:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Zakonske obaveze</li>
              <li>Zaštite naših prava</li>
              <li>Dobavljači usluga potrebni za funkcionisanje platforme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Bezbednost</h2>
            <p className="mb-4">
              Koristimo industrijske standarde za zaštitu vaših podataka, uključujući enkripciju i bezbedne servere.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Vaša prava</h2>
            <p className="mb-4">
              Imate pravo da:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pristupite svojim podacima</li>
              <li>Ispravite netačne informacije</li>
              <li>Zatražite brisanje naloga</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Kontakt</h2>
            <p>
              Za pitanja o privatnosti, kontaktirajte nas na: privacy@reelestate.rs
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}