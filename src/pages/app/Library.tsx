import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video, Image, FileText } from 'lucide-react';

export function Library() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-1 font-bold mb-2">Moja biblioteka</h1>
          <p className="text-text-muted text-lg">
            Upravljajte svojim video projektima, fotografijama i materijalima na jednom mestu
          </p>
        </div>
        <Button size="lg" className="gradient-primary">
          <Plus className="h-5 w-5 mr-2" />
          Novi projekat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Video className="h-5 w-5 mr-2 text-primary" />
              Video projekti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">12</div>
            <CardDescription>Ukupno generisanih videa</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Image className="h-5 w-5 mr-2 text-primary" />
              Fotografije
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">248</div>
            <CardDescription>Uploadovanih slika</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Nacrți
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">8</div>
            <CardDescription>Sačuvanih nacrta</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-heading-2 font-semibold mb-6">Nedavni projekti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder project cards */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover-lift cursor-pointer">
              <div className="aspect-video bg-gradient-primary rounded-t-xl"></div>
              <CardHeader>
                <CardTitle className="text-lg">Stan u centru grada #{i}</CardTitle>
                <CardDescription>
                  Kreiran pre {i} dana • Video • 30s
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Otvori projekat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}