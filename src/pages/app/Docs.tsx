import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Download, Star } from 'lucide-react';

const guides = [
  {
    title: "Osnove Reel Studio-a",
    description: "Naučite kako da kreirate profesionalne video prezentacije nekretnina",
    duration: "5 min",
    type: "Video vodič",
    featured: true,
  },
  {
    title: "Stage Studio - AI namestanje",
    description: "Kako da koristite AI za virtuelno uređenje prostora",
    duration: "8 min", 
    type: "Video vodič",
    featured: true,
  },
  {
    title: "Optimizacija fotografija",
    description: "Najbolje prakse za fotografisanje nekretnina",
    duration: "12 min",
    type: "Písani vodič",
    featured: false,
  },
  {
    title: "Kreiranje glatkih prelaza",
    description: "Tehnike za profesionalne video prelaze između prostorija",
    duration: "6 min",
    type: "Video vodič", 
    featured: false,
  },
];

const examples = [
  {
    title: "Luksuzan penthouse",
    description: "Kompletna video prezentacija luksuznog stana",
    views: "2.4k",
    type: "Video primer",
  },
  {
    title: "Porodična kuća",
    description: "Kreiranje video ture kroz veliki porodičnu kuću",
    views: "1.8k",
    type: "Video primer",
  },
  {
    title: "Studio apartman",
    description: "Efikasno prikazivanje malog prostora",
    views: "3.1k",
    type: "Video primer",
  },
];

export function Docs() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-heading-1 font-bold mb-2">Vodič & primeri</h1>
        <p className="text-text-muted text-lg">
          Naučite kako da maksimalno iskoristite Reel Estate platformu
        </p>
      </div>

      {/* Featured Guides */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2 font-semibold">Preporučeni vodiči</h2>
          <Button variant="outline">
            Svi vodiči
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {guides.filter(guide => guide.featured).map((guide, index) => (
            <Card key={index} className="hover-lift cursor-pointer">
              <div className="aspect-video bg-gradient-primary rounded-t-xl flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{guide.type}</Badge>
                  <div className="flex items-center text-sm text-text-muted">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                    Preporučeno
                  </div>
                </div>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">{guide.duration}</span>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Pokreni
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* All Guides */}
        <section>
          <h2 className="text-heading-2 font-semibold mb-6">Svi vodiči</h2>
          <div className="space-y-4">
            {guides.map((guide, index) => (
              <Card key={index} className="hover-lift cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{guide.type}</Badge>
                    <span className="text-sm text-text-muted">{guide.duration}</span>
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Otvori vodič
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="text-heading-2 font-semibold mb-6">Video primeri</h2>
          <div className="space-y-4">
            {examples.map((example, index) => (
              <Card key={index} className="hover-lift cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{example.type}</Badge>
                    <span className="text-sm text-text-muted">{example.views} pregleda</span>
                  </div>
                  <CardTitle className="text-lg">{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Play className="h-4 w-4 mr-2" />
                      Pokreni
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Preuzmi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}