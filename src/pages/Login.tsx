import { useEffect } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        navigate('/app');
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          navigate('/app');
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (user) {
    return null; // Will redirect
  }

  const checkUserExists = async (email: string) => {
    try {
      // Try to sign in with a dummy password to check if user exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check'
      });
      
      // If error message indicates user not found, return false
      if (error?.message?.includes('Invalid login credentials')) {
        return false;
      }
      
      // If any other error or success, user exists
      return true;
    } catch {
      return false;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (!showPasswordField) {
        // Step 1: Check if user exists
        setCurrentEmail(email);
        const userExists = await checkUserExists(email);
        
        if (userExists) {
          setShowPasswordField(true);
        } else {
          setShowAccessPanel(true);
        }
      } else {
        // Step 2: Actual login
        const { error } = await supabase.auth.signInWithPassword({
          email: currentEmail,
          password,
        });

        if (error) throw error;
        
        toast.success('Uspešno ste se prijavili!');
        navigate('/app');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri prijavljivanju');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Pristupi nalogu</CardTitle>
            <CardDescription>
              Unesite vaše podatke za pristup platformi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Unesi e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vas@email.com"
                  value={showPasswordField ? currentEmail : ''}
                  required
                  disabled={isLoading || showPasswordField}
                />
              </div>
              
              {showPasswordField && (
                <div className="space-y-2">
                  <Label htmlFor="password">Lozinka</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Učitavanje...' : showPasswordField ? 'Prijavi se' : 'Nastavi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {showAccessPanel && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Nemaš nalog?</CardTitle>
              <CardDescription>
                Trenutno primamo klijente u privatnu betu.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" className="w-full">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Zatraži rani pristup
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}