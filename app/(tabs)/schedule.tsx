// app/(tabs)/schedule.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Vibration, // Opcional para feedback háptico
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'; // Para ícones

import { buildAvailableSlots } from '~/utils/dates';
import { useSettings } from '~/store/settings';

import { fetchDayBookings, createBooking } from '~/services/bookings';
import { useAuth } from '~/store/auth';
// Importe Card e EmptyState se existirem; senão, use os fallbacks inline
// import { Card, EmptyState } from '~/components/UI';

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function toLocalDateString(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isPastDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const selected = new Date(y, m - 1, d, 0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}
function isToday(dateStr: string) {
  return dateStr === toLocalDateString();
}
function nowHHMM() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Fallback para EmptyState se não existir em ~/components/UI
function EmptyState({ title, subtitle, iconName = 'event-busy' }: { title: string; subtitle: string; iconName?: string }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name={iconName as any} size={48} color="#9aa0a6" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

// Fallback para Card se não existir
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function Schedule() {
  const { settings, blocks, load } = useSettings();
  const { profile } = useAuth();

  const today = toLocalDateString();
  const [date, setDate] = useState<string>(today);
  const [available, setAvailable] = useState<string[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading global
  const [isCreating, setIsCreating] = useState(false); // Loading para criação

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!settings || isPastDate(date)) {
        setAvailable([]);
        setDayBookings([]);
        return;
      }

      setIsLoading(true);
      try {
        const b = await fetchDayBookings(date);
        setDayBookings(b);

        const mapped = b.map((x: any) => ({
          id: x.id,
          userId: x.user_id,
          date: x.date,
          startTime: x.start_time,
          endTime: x.end_time,
          bufferUntil: x.buffer_until,
          status: x.status,
          createdAt: x.created_at,
        }));

        let av = buildAvailableSlots(
          date,
          settings.openTime,
          settings.closeTime,
          mapped as any,
          blocks as any
        ) as string[];

        if (isToday(date)) {
          const now = nowHHMM();
          av = av.filter((t) => t >= now);
        }

        setAvailable(av);
      } catch (error) {
        console.error('Erro ao carregar dados do dia:', error);
        Alert.alert('Erro', 'Falha ao carregar horários. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [date, settings, blocks]);

  const onPick = useCallback(async (t: string) => {
    if (!profile) {
      Alert.alert('Erro', 'Você precisa estar logado para agendar.');
      return;
    }

    if (isToday(date) && t < nowHHMM()) {
      Alert.alert('Horário Inválido', 'Não é possível reservar para um horário já passado. Escolha outro.');
      return;
    }
    if (isPastDate(date)) {
      Alert.alert('Data Inválida', 'Não é possível reservar em datas anteriores a hoje.');
      return;
    }

    setIsCreating(true);
    try {
      await createBooking(profile.id, date, t);
      Vibration.vibrate(100); // Feedback háptico opcional (iOS/Android)

      // Recarrega dados do dia
      const b = await fetchDayBookings(date);
      setDayBookings(b);
      const mapped = b.map((x: any) => ({
        id: x.id,
        userId: x.user_id,
        date: x.date,
        startTime: x.start_time,
        endTime: x.end_time,
        bufferUntil: x.buffer_until,
        status: x.status,
        createdAt: x.created_at,
      }));

      let av = buildAvailableSlots(
        date,
        settings!.openTime,
        settings!.closeTime,
        mapped as any,
        blocks as any
      ) as string[];

      if (isToday(date)) {
        const now = nowHHMM();
        av = av.filter((tt) => tt >= now);
      }

      setAvailable(av);
      Alert.alert('Sucesso!', 'Reserva criada com sucesso. Você receberá uma confirmação.');
    } catch (e: any) {
      Alert.alert('Erro ao Agendar', e.message || 'Tente novamente mais tarde.');
    } finally {
      setIsCreating(false);
    }
  }, [profile, date, settings, blocks]);

  const onDayPress = useCallback((day: { dateString: string }) => {
    if (isPastDate(day.dateString)) return;
    setDate(day.dateString);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Carregando calendário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'schedule';
      case 'completed': return 'check-circle';
      case 'canceled': return 'cancel';
      default: return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'canceled': return '#ef4444';
      default: return '#9aa0a6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Agende sua Reserva</Text>

        <Calendar
          minDate={today}
          onDayPress={onDayPress}
          markedDates={{ [date]: { selected: true, selectedColor: '#20232a' } }}
          theme={{
            backgroundColor: '#0b0f13',
            calendarBackground: '#0b0f13',
            textSectionTitleColor: '#ffffff',
            textSectionTitleDisabledColor: '#9aa0a6',
            selectedDayBackgroundColor: '#20232a',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#10b981',
            dayTextColor: '#ffffff',
            textDisabledColor: '#555555',
            dotColor: '#9aa0a6',
            selectedDotColor: '#ffffff',
            arrowColor: '#ffffff',
            disabledArrowColor: '#555555',
            monthTextColor: '#ffffff',
            indicatorColor: '#20232a',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          hideExtraDays
          enableSwipeMonths
          accessibilityLabel={`Calendário - Data selecionada: ${date}`}
        />

        <Text style={styles.sectionTitle}>Horários Disponíveis ({date})</Text>

        <View style={styles.slotsContainer}>
          {available.length > 0 ? (
            available.map((t) => (
              <Pressable
                key={t}
                onPress={() => onPick(t)}
                disabled={isCreating}
                style={({ pressed }) => [
                  styles.slotButton,
                  { opacity: pressed || isCreating ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Agendar para ${t} - Duração 60 minutos`}
                accessibilityHint="Toque para reservar este horário"
              >
                <MaterialIcons name="access-time" size={16} color="#ffffff" />
                <Text style={styles.slotText}>{t} – 60min</Text>
                <Text style={styles.slotBuffer}>+10min buffer</Text>
              </Pressable>
            ))
          ) : (
            <EmptyState
              title="Sem Horários Disponíveis"
              subtitle="Este dia está lotado ou já passou. Escolha outra data no calendário."
              iconName="event-busy"
            />
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f13',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#0b0f13',
    flexGrow: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  slotButton: {
    flexDirection: 'row',
    backgroundColor: '#11161b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
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
  slotText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  slotBuffer: {
    color: '#9aa0a6',
    fontSize: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#11161b',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
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
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#20232a',
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTime: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingStatus: {
    color: '#9aa0a6',
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0f13',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#20232a',
    borderRadius: 12,
    marginTop: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#9aa0a6',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
