import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Video, Sofa } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  user?: User;
  session?: Session;
  progress?: number;
}

export function Navigation({ user, session, progress = 0 }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className="border-b bg-white/70 backdrop-blur">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Smartflow Branding */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold">S</div>
            <div className="text-xl font-bold">Smartflow</div>
            <div className="text-muted-foreground ml-2">Video oglasi</div>
          </div>
          
          {/* Navigation Links */}
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
        
        {/* Right side - Progress and Sign Out (only show if user is authenticated) */}
        {user && (
          <div className="flex items-center gap-4">
            <ProgressBar value={progress} />
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Odjavi se
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}