import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  webhook_url: string | null;
  org_name: string | null;
}

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, webhook_url, org_name')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile not found, create one
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                webhook_url: null,
                org_name: null,
              })
              .select('id, webhook_url, org_name')
              .single();

            if (insertError) {
              throw insertError;
            }
            setProfile(newProfile);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
};