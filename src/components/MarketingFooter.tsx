import { Link } from 'react-router-dom';

export function MarketingFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 Reel Estate. Sva prava zadržana.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link 
              to="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Uslovi korišćenja
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Politika privatnosti
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}