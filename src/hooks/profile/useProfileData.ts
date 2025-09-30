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
          .single();

        if (error) {
          console.error('Erro ao buscar organização:', error);
          setOrgName(null);
        } else {
          setOrgName(data?.name || null);
        }
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
    : orgName || profile?.organization_id?.trim() || 'Não informado';

  return {
    profile,
    orgLabel,
    isAdmin: profile?.role === 'admin',
    loadingOrg,
  };
};