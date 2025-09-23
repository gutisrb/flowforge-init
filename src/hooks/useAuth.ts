import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth'; // <-- Sada uvozimo ispravno
import { Profile } from '@/integrations/supabase/types'; // <-- Koristimo tvoj postojeći tip

export const useProfile = () => {
  const { user } = useAuth(); // Dobijamo korisnika

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id], // Ključ zavisi od user.id
    queryFn: async () => {
      if (!user) {
        return null;
      }

      // 1. Pokušaj da pronađeš profil
      const { data, error } = await supabase
        .from('profiles')
        .select('id, org_name, webhook_url, tier, video_credits_remaining, image_credits_remaining')
        .eq('id', user.id)
        .single();

      if (error) {
        // 2. Ako ne postoji (npr. novi korisnik), napravi ga
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              org_name: 'Nova Agencija',
              webhook_url: '' // Dodajemo ovo da bi se poklapalo sa tabelom
            })
            .select('id, org_name, webhook_url, tier, video_credits_remaining, image_credits_remaining')
            .single();

          if (insertError) {
            console.error('Greška pri kreiranju profila:', insertError);
            throw insertError;
          }
          return newProfile;
        }
        
        console.error('Greška pri dohvatanju profila:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user, // Pokreni samo ako je korisnik ulogovan
  });
};