import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

interface AuthWrapperProps {
  children: (user: User, session: Session) => React.ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <div className="text-white font-bold text-lg">S</div>
          </div>
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-xl">S</div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Smartflow</h1>
            <p className="text-muted-foreground">Prijavite se da nastavite</p>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary))',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'hsl(var(--secondary))',
                      defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--primary))',
                      inputBorderFocus: 'hsl(var(--primary))',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2 rounded-md font-medium transition-colors',
                  input: 'w-full px-3 py-2 rounded-md border transition-colors',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin}
              onlyThirdPartyProviders={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children(user, session)}</>;
};