import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/store/auth';

export const useProfileData = () => {
  const { profile } = useAuth();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  useEffect(() => {
    async function loadOrgName() {
      if (!profile?.organization_id) {
        setOrgName(null);
        return;
      }

      setLoadingOrg(true);

      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .maybeSingle(); // 👈 evita erro se não houver resultado

        if (error) {
          console.error('Erro ao buscar organização:', error);
          setOrgName(null);
          return;
        }

        if (!data) {
          console.warn(`Organização não encontrada para o ID: ${profile.organization_id}`);
          setOrgName(null);
          return;
        }

        setOrgName(data.name);
      } catch (e) {
        console.error('Erro inesperado ao buscar organização:', e);
        setOrgName(null);
      } finally {
        setLoadingOrg(false);
      }
    }

    loadOrgName();
  }, [profile?.organization_id]);

  const orgLabel = loadingOrg
    ? 'Carregando...'
    : orgName || 'Organização não encontrada';

  return {
    profile,
    orgLabel,
    isAdmin: profile?.role === 'admin',
    loadingOrg,
  };
};
