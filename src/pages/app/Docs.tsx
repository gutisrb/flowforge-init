import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

const guides = [
  {
    id: 'prvi-video',
    title: 'Prvi video za 15 minuta',
    content: {
      title: 'Prvi video za 15 minuta',
      text: 'Naučite kako da kreirate profesionalan video prezentaciju nekretnine za samo 15 minuta koristeći naše alate. Ovaj vodič pokriva osnovne korake od importovanja fotografija do izvoza finalnog videa.',
      codeTemplate: `[Template za Oglas]
✨ TRANSFORMACIJA ✨

Pogledajte kako smo ovaj prostor pretvorili iz [KADAR A] u [KADAR B]!

📍 Lokacija: [Unesi Lokaciju]
💰 Cena: [Unesi Cenu]

#realestate #transformacija #nekretnine #ai`
    }
  },
  {
    id: 'frame-to-frame',
    title: 'Frame-to-frame: glatki prelazi',
    content: {
      title: 'Frame-to-frame: glatki prelazi',
      text: 'Savladajte tehnike kreiranja glatkih prelaza između fotografija za profesionalni video. Ovaj vodič pokriva napredne opcije editovanja i animacije.',
      codeTemplate: null
    }
  },
  {
    id: 'ai-namestanje',
    title: 'AI nameštanje: da izgleda stvarno',
    content: {
      title: 'AI nameštanje: da izgleda stvarno',
      text: 'Koristite AI alate za virtuelno nameštanje prostora da bi vaša nekretnina izgledala privlačnije za potencijalne kupce. Naučite napredne tehnike stilizovanja.',
      codeTemplate: null
    }
  }
];

export function Docs() {
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyToClipboard = () => {
    if (selectedGuide.content.codeTemplate) {
      navigator.clipboard.writeText(selectedGuide.content.codeTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-80 bg-card border-r border-border fixed h-full">
          <div className="p-6">
            {/* Search Input */}
            <Input
              type="text"
              placeholder="Pretraga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-6"
            />

            {/* Navigation Links */}
            <nav className="space-y-2">
              {filteredGuides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGuide.id === guide.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {guide.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="ml-80 flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-heading-1 mb-6">{selectedGuide.content.title}</h1>
            
            <p className="text-body text-text-muted mb-8">
              {selectedGuide.content.text}
            </p>

            {/* Code Block - only show for the first guide */}
            {selectedGuide.content.codeTemplate && (
              <Card className="bg-muted border border-border">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-sm font-medium text-foreground">Template</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="h-8 px-3"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Kopirano
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Kopiraj
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-4 text-sm text-foreground font-mono whitespace-pre-wrap">
                  {selectedGuide.content.codeTemplate}
                </pre>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}