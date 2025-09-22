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
      <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Smartflow Branding */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">S</div>
            <div className="text-heading-3 font-semibold text-text-primary">Smartflow</div>
            <div className="text-body text-text-muted ml-2">Video oglasi</div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-2">
            <Link
              to="/app"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-2xl text-body font-medium transition-all duration-150 hover-lift",
                location.pathname === "/app"
                  ? "bg-primary text-primary-foreground shadow-raised"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-calm"
              )}
            >
              <Video className="h-4 w-4" />
              <span>AI Video Generator</span>
            </Link>
            <Link
              to="/app/furnisher"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-2xl text-body font-medium transition-all duration-150 hover-lift",
                location.pathname === "/app/furnisher"
                  ? "bg-primary text-primary-foreground shadow-raised"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-calm"
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => supabase.auth.signOut()}
              className="rounded-2xl border-border-subtle hover:border-border hover-lift focus-ring"
            >
              Odjavi se
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}