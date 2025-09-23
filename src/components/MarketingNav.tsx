import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function MarketingNav() {
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="80" height="80" rx="16" ry="16" fill="url(#logoGradient)" stroke="white" strokeWidth="2"/>
              <rect x="15" y="15" width="70" height="20" rx="2" ry="2" fill="white" fillOpacity="0.2"/>
              <path d="M20 20 L30 30 M25 20 L35 30 M30 20 L40 30 M35 20 L45 30 M40 20 L50 30 M45 20 L55 30 M50 20 L60 30 M55 20 L65 30 M60 20 L70 30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M40 50 L65 65 L40 80 Z" fill="white"/>
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#10B981] bg-clip-text text-transparent">Reel Estate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#kako" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('kako')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Kako
            </a>
            <a 
              href="#zasto" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('zasto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Zašto
            </a>
            <a 
              href="#funkcije" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('funkcije')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Funkcije
            </a>
            <a 
              href="#cena" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cena')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cena
            </a>
            <a 
              href="#faq" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
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