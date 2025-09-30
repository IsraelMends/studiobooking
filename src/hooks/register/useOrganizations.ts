import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '~/lib/supabase';
import { Organization } from '~/types/register/register.types';

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name")
          .order("name", { ascending: true });
          
        if (error) throw error;
        
        if (isMounted) {
          setOrganizations(data ?? []);
        }
      } catch (err: any) {
        console.error("Erro ao carregar organizações:", err?.message);
        Alert.alert("Erro", "Não foi possível carregar as organizações.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrganizations();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { organizations, loading };
};