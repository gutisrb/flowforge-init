import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// This defines what a user's profile looks like in our app
export interface Profile {
  id: string;
  org_name: string | null;
  webhook_url: string;
  tier: 'starter' | 'pro' | 'scale';
  video_credits_remaining: number;
  image_credits_remaining: number;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  const queryResult = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }

      // First try to fetch the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If the profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              org_name: 'New Agency', 
              webhook_url: '' 
            })
            .select('*')
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
          return newProfile as Profile;
        }
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: queryResult.data,
    loading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

