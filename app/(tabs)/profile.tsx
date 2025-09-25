// app/(tabs)/profile.tsx
import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'; // Para ícones (instale se necessário: npx expo install @expo/vector-icons)

import { useAuth } from '~/store/auth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { profile, logout } = useAuth(); // Removido isLoading para compatibilidade com AuthState
  const router = useRouter();

  const isAdmin = profile?.role === 'admin';
  const orgLabel = profile?.organization_id?.trim() || 'Não informado';

  const handleLogout = useCallback(async () => {
    // Opcional: Confirmação antes de logout
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
              Alert.alert('Erro ao Sair', String(e?.message ?? e) || 'Tente novamente.');
            }
          },
        },
      ]
    );
  }, [logout, router]);

  // Se profile não estiver carregado, mostra fallback simples (sem loading spinner)
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.greeting}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {/* Placeholder para avatar */}
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={48} color="#9aa0a6" />
        </View>

        <Text style={styles.greeting}>Olá, {profile.name ?? 'Usuário'}! 👋</Text>
        <Text style={styles.email}>{profile.email ?? 'sem e-mail'}</Text>
        <Text style={styles.orgText}>Faculdade/Empresa: {orgLabel}</Text>

        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isAdmin ? '#0c2b24' : '#11202a',
              },
            ]}
          >
            <MaterialIcons
              name={isAdmin ? 'admin-panel-settings' : 'person'}
              size={16}
              color={isAdmin ? '#10b981' : '#61dafb'}
            />
            <Text
              style={[
                styles.roleText,
                { color: isAdmin ? '#10b981' : '#61dafb' },
              ]}
            >
              {isAdmin ? 'Administrador' : 'Usuário'}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        accessibilityHint="Encerra a sessão e redireciona para o login"
      >
        <MaterialIcons name="logout" size={20} color="#ffffff" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f13',
    padding: 16,
    gap: 20,
  },
  card: {
    backgroundColor: '#11161b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#20232a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  email: {
    color: '#9aa0a6',
    fontSize: 16,
    textAlign: 'center',
  },
  orgText: {
    color: '#9aa0a6',
    fontSize: 14,
    textAlign: 'center',
  },
  badgeContainer: {
    marginTop: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontWeight: '800',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444', // Vermelho para ação destrutiva
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
});