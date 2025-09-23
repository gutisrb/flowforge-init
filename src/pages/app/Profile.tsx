import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { User } from '@supabase/supabase-js';

interface AgencyFormData {
  org_name: string;
}

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const { profile, loading } = useProfile(user);
  const { toast } = useToast();
  
  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const agencyForm = useForm<AgencyFormData>({
    defaultValues: {
      org_name: profile?.org_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form when profile loads
  useState(() => {
    if (profile) {
      agencyForm.reset({
        org_name: profile.org_name || '',
      });
    }
  });

  const onAgencySubmit = async (data: AgencyFormData) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ org_name: data.org_name })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom čuvanja izmena.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Uspešno",
        description: "Izmene su sačuvane.",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Greška",
        description: "Lozinke se ne poklapaju.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom promene lozinke.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Uspešno",
        description: "Lozinka je promenjena.",
      });
      passwordForm.reset();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Da li ste sigurni da želite da obrišete nalog? Ova akcija se ne može poništiti.')) {
      // This would require additional backend logic to properly delete user data
      toast({
        title: "Kontaktirajte podršku",
        description: "Za brisanje naloga kontaktirajte našu podršku.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-8">Učitavanje...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profil</h1>
          <p className="text-muted-foreground">
            Upravljajte svojim nalogom i podešavanjima
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - User Info */}
          <div>
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {profile?.org_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profile?.org_name || 'Korisnik'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full"
                >
                  Odjavi se
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forms */}
          <div className="space-y-6">
            
            {/* Agency Settings Form */}
            <Card>
              <CardHeader>
                <CardTitle>Podešavanja Agencije</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...agencyForm}>
                  <form onSubmit={agencyForm.handleSubmit(onAgencySubmit)} className="space-y-4">
                    <FormField
                      control={agencyForm.control}
                      name="org_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ime agencije</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Sačuvaj izmene</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Password Change Form */}
            <Card>
              <CardHeader>
                <CardTitle>Promena Lozinke</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova lozinka</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potvrdite novu lozinku</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Promeni lozinku</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Opasna Zona</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Obriši nalog
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}