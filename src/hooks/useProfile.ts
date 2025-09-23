import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth'; // We will create this hook next

// This defines what a user's profile looks like in our app
export interface Profile {
  id: string;
  org_name: string | null;
  webhook_url: string | null;
  tier: 'starter' | 'pro' | 'scale';
  video_credits_remaining: number;
  image_credits_remaining: number;
}

export const useProfile = () => {
  const { user } = useAuth(); // Get the currently logged-in user

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }

      // Fetch the user's profile from the 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, org_name, webhook_url, tier, video_credits_remaining, image_credits_remaining')
        .eq('id', user.id)
        .single();

      if (error) {
        // If the profile doesn't exist, create it. This is for new sign-ups.
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, org_name: 'New Agency' }) // Defaults are set by the database
            .select('id, org_name, webhook_url, tier, video_credits_remaining, image_credits_remaining')
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
          return newProfile;
        }
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user, // Only run this query if the user is logged in
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// We need a simple hook to get the user from Supabase auth state
// This avoids prop drilling the user object everywhere
export const useAuth = () => {
    const [user, setUser] = useState(supabase.auth.getUser());

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user };
}
