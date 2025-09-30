import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '~/store/auth';
import { useRouter } from 'expo-router';

export const useLogout = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair? Você será redirecionado para a tela de login.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.resolve(logout());
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert(
                'Erro ao Sair',
                String(e?.message ?? e) || 'Tente novamente.'
              );
            }
          },
        },
      ]
    );
  }, [logout, router]);

  return { handleLogout };
};