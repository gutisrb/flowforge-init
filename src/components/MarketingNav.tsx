import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function MarketingNav() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 marketing-nav">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {/* Desktop: Show wordmark */}
            <img 
              src="/brand/wordmark.png" 
              alt="Reel Estate" 
              className="hidden sm:block h-22 w-auto object-contain nav-text" 
            />
            {/* Mobile: Show mark only */}
            <img 
              src="/brand/mark.png" 
              alt="Reel Estate" 
              className="block sm:hidden h-10 w-auto object-contain nav-text" 
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {[
              { name: 'Kako', id: 'kako' },
              { name: 'Zašto', id: 'zasto' },
              { name: 'Funkcije', id: 'funkcije' },
              { name: 'Cena', id: 'cena' },
              { name: 'FAQ', id: 'faq' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="nav-text hover:opacity-80 transition-all text-sm font-medium"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <Link to="/login">
            <Button className="gradient-cta text-white font-medium px-6">
              Započni rani pristup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}