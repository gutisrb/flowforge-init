import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Video, Sofa } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center space-x-8">
          <div className="flex space-x-6">
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Video className="h-4 w-4" />
              <span>AI Video Generator</span>
            </Link>
            <Link
              to="/furnisher"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/furnisher"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Sofa className="h-4 w-4" />
              <span>AI Furnisher</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}