// app/(tabs)/home.tsx
import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'; // Para ícones (instale se necessário: npx expo install @expo/vector-icons)

import { useBookings } from '../../src/store/booking';
import { useAuth } from '../../src/store/auth';

import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router'; // Corrigido: import de expo-router

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatação em PT-BR (adicione se não tiver)

export default function Home() {
  const { myNext, loadMyNext } = useBookings();
  const { profile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Estado de loading

  // Saudação dinâmica baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    loadMyNext().finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadMyNext().finally(() => setIsLoading(false));
    }, [loadMyNext])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loading} />
        <Text style={styles.loadingText}>Carregando sua agenda...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Saudação */}
      <Text style={styles.greeting}>
        {getGreeting()}, {profile?.name?.split(' ')[0] ?? 'bem-vindo'} 👋
      </Text>

      {/* Card Próxima Agenda */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="event" size={20} color="#9aa0a6" />
          <Text style={styles.cardTitle}>Sua próxima agenda</Text>
        </View>
        {myNext ? (
          <>
            <Text style={styles.nextBookingDate}>
              {format(
                new Date(`${myNext.date}T${myNext.start_time}`),
                "EEE, dd MMM yyyy — HH:mm",
                { locale: ptBR }
              )}
            </Text>
            <Text style={styles.durationText}>Duração: 60 min (+10 min buffer)</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/my-bookings')}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ver agenda completa"
              accessibilityHint="Navega para a tela de minhas agendas"
            >
              <MaterialIcons name="calendar-today" size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Ver Minha Agenda</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.noBookingText}>
              Você ainda não tem reservas futuras. Que tal agendar uma?
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/schedule')}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Agendar uma nova reserva"
              accessibilityHint="Navega para a tela de agendamento"
            >
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={styles.buttonText}>Agendar agora</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Seção Admin (agrupada para melhor UX) */}
      {profile?.role === 'admin' && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Painel Admin</Text>
          <View style={styles.adminCards}>
            <Pressable
              onPress={() => router.push('/(admin)/users')}
              style={({ pressed }) => [
                styles.adminCard,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar usuários e agendas"
              accessibilityHint="Abre a tela de gerenciamento de usuários"
            >
              <MaterialIcons name="people" size={24} color="#ffffff" />
              <View style={styles.cardContent}>
                <Text style={styles.adminCardTitle}>Gerenciar usuários & agendas</Text>
                <Text style={styles.adminCardSubtitle}>Veja reservas de cada usuário</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/admin/reports')}
              style={({ pressed }) => [
                styles.adminCard,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar relatórios"
              accessibilityHint="Abre a tela de relatórios de reservas"
            >
              <MaterialIcons name="assessment" size={24} color="#ffffff" />
              <View style={styles.cardContent}>
                <Text style={styles.adminCardTitle}>Gerenciar relatórios</Text>
                <Text style={styles.adminCardSubtitle}>Veja relatórios de reservas</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(admin)/day')}
              style={({ pressed }) => [
                styles.adminCard,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar agenda diária"
              accessibilityHint="Abre a tela de agenda por dia"
            >
              <MaterialIcons name="date-range" size={24} color="#ffffff" />
              <View style={styles.cardContent}>
                <Text style={styles.adminCardTitle}>Gerenciar agenda diária</Text>
                <Text style={styles.adminCardSubtitle}>Veja reservas por dia</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
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
  greeting: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#11161b',
    borderRadius: 16,
    padding: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    color: '#9aa0a6',
    fontSize: 16,
    fontWeight: '700',
  },
  nextBookingDate: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  durationText: {
    color: '#9aa0a6',
    fontSize: 14,
    marginBottom: 12,
  },
  noBookingText: {
    color: '#9aa0a6',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#20232a',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  adminSection: {
    gap: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  adminCards: {
    gap: 12,
  },
  adminCard: {
    flexDirection: 'row',
    backgroundColor: '#1a2a33',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
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
  cardContent: {
    flex: 1,
  },
  adminCardTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  adminCardSubtitle: {
    color: '#9aa0a6',
    fontSize: 14,
    marginTop: 2,
  },
  loading: {
    marginTop: 100,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});
