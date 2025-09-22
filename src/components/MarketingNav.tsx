import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/reel-estate-logo.png';

export function MarketingNav() {
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logoImage} alt="Reel Estate" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">Reel Estate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#kako" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Kako
            </a>
            <a 
              href="#zasto" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Zašto
            </a>
            <a 
              href="#funkcije" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Funkcije
            </a>
            <a 
              href="#cena" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cena
            </a>
            <a 
              href="#faq" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* CTA Button */}
          <Button asChild>
            <Link to="/app/login">Započni rani pristup</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}