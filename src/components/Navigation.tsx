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
    <nav className="page-header border-b border-border bg-background/95 backdrop-blur-md shadow-card">
      <div className="container max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Smartflow Branding */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">S</div>
            <div className="text-lg font-semibold text-text-primary">Smartflow</div>
            <div className="text-sm text-text-muted ml-1">Video oglasi</div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-1">
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover-lift",
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground shadow-raised"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-calm"
              )}
            >
              <Video className="h-3.5 w-3.5" />
              <span>AI Video Generator</span>
            </Link>
            <Link
              to="/furnisher"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover-lift",
                location.pathname === "/furnisher"
                  ? "bg-primary text-primary-foreground shadow-raised"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-calm"
              )}
            >
              <Sofa className="h-3.5 w-3.5" />
              <span>AI Furnisher</span>
            </Link>
          </div>
        </div>
        
        {/* Right side - Progress and Sign Out (only show if user is authenticated) */}
        {user && (
          <div className="flex items-center gap-3">
            <ProgressBar value={progress} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => supabase.auth.signOut()}
              className="h-8 px-3 py-1 text-xs rounded-xl border-border-subtle hover:border-border hover-lift focus-ring"
            >
              Odjavi se
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}