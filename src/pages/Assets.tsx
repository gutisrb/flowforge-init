import { useState } from 'react';
import { AssetCard } from '@/components/AssetCard';
import { Button } from '@/components/ui/button';

interface Asset {
  id: string;
  thumbnail: string;
  title: string;
  type: 'Video' | 'Pre-Posle';
  duration?: string;
  date: string;
  status: 'Draft' | 'Spremno' | 'Greška';
  description?: string;
}

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: '1',
    thumbnail: '/placeholder.svg',
    title: 'Stan na Vračaru - Luksuzni dvosoban',
    type: 'Video',
    duration: '2:15',
    date: '2024-01-15',
    status: 'Spremno',
    description: 'Moderno opremljen stan u centru Beograda sa panoramskim pogledom na grad.'
  },
  {
    id: '2', 
    thumbnail: '/placeholder.svg',
    title: 'Kuća u Zemunu - Pre i posle renoviranja',
    type: 'Pre-Posle',
    date: '2024-01-12',
    status: 'Draft'
  },
  {
    id: '3',
    thumbnail: '/placeholder.svg', 
    title: 'Poslovni prostor Novi Beograd',
    type: 'Video',
    duration: '3:22',
    date: '2024-01-10',
    status: 'Greška'
  }
];

type FilterType = 'Svi' | 'Video' | 'Pre-Posle' | 'Draft' | 'Spremno';

const Assets = () => {
  const [filter, setFilter] = useState<FilterType>('Svi');
  const [assets] = useState<Asset[]>(mockAssets);

  const filteredAssets = assets.filter(asset => {
    if (filter === 'Svi') return true;
    if (filter === 'Video' || filter === 'Pre-Posle') return asset.type === filter;
    return asset.status === filter;
  });

  const isEmpty = filteredAssets.length === 0;

  const filters: FilterType[] = ['Svi', 'Video', 'Pre-Posle', 'Draft', 'Spremno'];

  return (
    <div className="min-h-screen bg-surface-calm">
      <main className="container max-w-7xl mx-auto px-6 py-6">
        <div className="mb-8">
          <h1 className="text-heading-1 text-text-primary mb-6">Moji videoi</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {filters.map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className={filter === filterOption ? "gradient-accent text-white" : ""}
              >
                {filterOption}
              </Button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-center">
              <h3 className="text-heading-3 text-text-muted mb-2">
                Još nema videa
              </h3>
              <p className="text-body text-text-subtle mb-6">
                Napravi prvi u Reel Studio.
              </p>
              <Button className="gradient-accent text-white">
                Kreiraj prvi video
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onPlay={(id) => console.log('Play asset:', id)}
                onDownload={(id) => console.log('Download asset:', id)}
                onDuplicate={(id) => console.log('Duplicate asset:', id)}
                onCopyDescription={(id) => console.log('Copy description:', id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Assets;