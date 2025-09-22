// app/(tabs)/profile.tsx
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '~/store/auth';

export default function Profile() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const isAdmin = profile?.role === 'admin';
  const orgLabel = profile?.organization?.trim() || 'Não informado';

  const handleLogout = async () => {
    try {
      // garante que o estado/tokens são limpos antes de navegar
      await Promise.resolve(logout());
      // 🔁 troque para a sua rota de login se for diferente
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Erro ao sair', String(e?.message ?? e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f13', padding: 16, gap: 16 }}>
      <View style={{ backgroundColor: '#11161b', borderRadius: 16, padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>
          {profile?.name ?? 'Usuário'}
        </Text>
        <Text style={{ color: '#9aa0a6', marginTop: 4 }}>
          {profile?.email ?? 'sem e-mail'}
        </Text>

        {/* Agora SEMPRE mostra a organização (para usuário padrão e admin) */}
        <Text style={{ color: '#9aa0a6', marginTop: 2 }}>
          Faculdade/Empresa: {orgLabel}
        </Text>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
          <Text
            style={{
              color: isAdmin ? '#10b981' : '#61dafb',
              fontWeight: '800',
              backgroundColor: isAdmin ? '#0c2b24' : '#11202a',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            {isAdmin ? 'Administrador' : 'Usuário'}
          </Text>
        </View>
      </View>

      <Pressable onPress={handleLogout} style={{ backgroundColor: '#20232a', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>
          Sair da conta
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
