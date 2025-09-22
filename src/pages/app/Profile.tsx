import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react';

export function Profile() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold mb-2">Profil</h1>
          <p className="text-text-muted text-lg">
            Upravljajte svojim nalogom i podešavanjima
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">Marko Petrović</CardTitle>
                <CardDescription>marko.petrovic@email.com</CardDescription>
                <div className="flex justify-center mt-4">
                  <Badge variant="secondary">Pro korisnik</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center text-text-muted">
                    <Calendar className="h-4 w-4 mr-2" />
                    Član od januara 2024
                  </div>
                  <div className="flex items-center text-text-muted">
                    <MapPin className="h-4 w-4 mr-2" />
                    Beograd, Srbija
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Lični podaci
                </CardTitle>
                <CardDescription>
                  Ažurirajte svoje osnovne informacije
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ime</Label>
                    <Input id="firstName" defaultValue="Marko" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Prezime</Label>
                    <Input id="lastName" defaultValue="Petrović" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email adresa</Label>
                  <Input id="email" type="email" defaultValue="marko.petrovic@email.com" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" defaultValue="+381 60 123 4567" />
                  </div>
                  <div>
                    <Label htmlFor="city">Grad</Label>
                    <Input id="city" defaultValue="Beograd" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Biografija</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Kratko opišite sebe..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button className="w-full md:w-auto">
                  Sačuvaj izmene
                </Button>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Podešavanja naloga</CardTitle>
                <CardDescription>
                  Upravljajte sigurnošću i privatnošću naloga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Trenutna lozinka</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">Nova lozinka</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Promeni lozinku
                  </Button>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Obriši nalog
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistike korišćenja</CardTitle>
                <CardDescription>
                  Pregled vaše aktivnosti na platformi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-text-muted">Kreiranih videa</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">156</div>
                    <div className="text-sm text-text-muted">Uploadovanih slika</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-sm text-text-muted">Sačuvanih nacrta</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}