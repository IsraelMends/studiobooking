import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Modal,
  Text,
  Vibration,
  View,
} from "react-native";

import styles from "../styles";

import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import { buildAvailableSlots } from "~/utils/dates";
import { useSettings } from "~/store/settings";

import {
  fetchDayBookings,
  createBooking,
} from "~/services/bookings";
import { useAuth } from "~/store/auth";
import React from "react";

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

function toHHMM(t?: string | null) {
  if (!t) return undefined as any;
  return t.slice(0, 5);
}
function hhmmToMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function EmptyState({
  title,
  subtitle,
  iconName = 'event-busy',
}: {
  title: string;
  subtitle: string;
  iconName?: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name={iconName as any} size={48} color="#9aa0a6" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const devices = ['Cameras', 'Microfones', 'Tripés', 'Iluminação', 'Refletores'];

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
      if (!profile?.organization_id) {
        setAvailable([]);
        setDayBookings([]);
        return;
      }

      setIsLoading(true);
      try {
        const raw = await fetchDayBookings(date, profile.organization_id);
        const b = (raw ?? []).filter((x: any) => x?.start_time && x?.end_time);

        setDayBookings(b);

        const mapped = b.map((x: any) => ({
          id: x.id,
          userId: x.user_id,
          date: x.date,
          startTime: toHHMM(x.start_time),
          endTime: toHHMM(x.end_time),
          bufferUntil: x.buffer_until ? toHHMM(x.buffer_until) : undefined,
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
          const nowM = hhmmToMin(nowHHMM());
          av = av.filter((t) => hhmmToMin(t) >= nowM);
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
  }, [date, settings, blocks, profile?.organization_id]);

  const toggleDevice = useCallback((device: string) => {
    setSelectedDevices((prev) =>
      prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
    );
  }, []);

  const confirmBooking = useCallback(async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('Seleção Obrigatória', 'Você deve selecionar pelo menos um aparelho para continuar.');
      return;
    }

    setShowDeviceModal(false);
    setIsCreating(true);
    try {
      if (!profile || !profile.organization_id) {
        Alert.alert('Erro', 'Você precisa estar logado e ter uma organização válida para agendar.');
        setIsCreating(false);
        return;
      }

      // Cria reserva no backend
      await createBooking(
        profile.id,
        profile.organization_id,
        date,
        selectedTime,
        selectedDevices
      );

      // Atualização otimista do estado local

      // Remove o horário reservado da lista disponível
      setAvailable((prev) => prev.filter((t) => t !== selectedTime));

      // Adiciona a nova reserva no dayBookings localmente
      setDayBookings((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`, // id temporário
          user_id: profile.id,
          date,
          start_time: selectedTime,
          end_time: (() => {
            // calcula 60 minutos depois
            const [h, m] = selectedTime.split(':').map(Number);
            let endH = h;
            let endM = m + 60;
            if (endM >= 60) {
              endH += Math.floor(endM / 60);
              endM = endM % 60;
            }
            return `${pad(endH)}:${pad(endM)}`;
          })(),
          buffer_until: (() => {
            // calcula 10 minutos buffer depois do end_time
            const [h, m] = selectedTime.split(':').map(Number);
            let bufferH = h;
            let bufferM = m + 70; // 60 + 10
            if (bufferM >= 60) {
              bufferH += Math.floor(bufferM / 60);
              bufferM = bufferM % 60;
            }
            return `${pad(bufferH)}:${pad(bufferM)}`;
          })(),
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ]);

      Vibration.vibrate(100);

      Alert.alert(
        'Sucesso!',
        `Reserva criada com sucesso para ${selectedTime}. Aparelhos: ${selectedDevices.join(', ')}.`
      );
    } catch (e: any) {
      Alert.alert('Erro ao Agendar', e?.message || 'Tente novamente mais tarde.');
    } finally {
      setIsCreating(false);
      setSelectedDevices([]);
      setSelectedTime('');
    }
  }, [profile, date, selectedTime, selectedDevices]);

  const onPick = useCallback(
    async (t: string) => {
      if (!profile) {
        Alert.alert('Erro', 'Você precisa estar logado para agendar.');
        return;
      }
      if (isToday(date) && hhmmToMin(t) < hhmmToMin(nowHHMM())) {
        Alert.alert('Horário Inválido', 'Não é possível reservar para um horário já passado.');
        return;
      }
      if (isPastDate(date)) {
        Alert.alert('Data Inválida', 'Não é possível reservar em datas anteriores a hoje.');
        return;
      }

      setSelectedTime(t);
      setSelectedDevices([]);
      setShowDeviceModal(true);
    },
    [profile, date]
  );

  const onDayPress = useCallback((day: { dateString: string }) => {
    if (isPastDate(day.dateString)) return;
    setDate(day.dateString);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'schedule';
      case 'completed':
        return 'check-circle';
      case 'canceled':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'canceled':
        return '#ef4444';
      default:
        return '#9aa0a6';
    }
  };

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
                disabled={isCreating || showDeviceModal}
                style={({ pressed }) => [
                  styles.slotButton,
                  { opacity: pressed || isCreating || showDeviceModal ? 0.7 : 1 },
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

        {dayBookings?.length > 0 && (
          <Card title="Reservas do dia">
            {dayBookings.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.bookingCard,
                  { borderLeftColor: getStatusColor(b.status) },
                ]}
              >
                <MaterialIcons
                  name={getStatusIcon(b.status) as any}
                  size={20}
                  color={getStatusColor(b.status)}
                />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTime}>
                    {toHHMM(b.start_time)} → {toHHMM(b.end_time)}
                  </Text>
                  <Text style={styles.bookingStatus}>{b.status}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Modal
        visible={showDeviceModal}
        animationType="slide"
        onRequestClose={() => setShowDeviceModal(false)}
        statusBarTranslucent={false}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione os Aparelhos a Utilizar</Text>
          <Text style={styles.modalSubtitle}>
            Horário: {selectedTime} | Data: {date} | Duração: 60min
          </Text>

          <View style={styles.devicesList}>
            {devices.map((device) => (
              <Pressable key={device} onPress={() => toggleDevice(device)} style={styles.deviceItem}>
                <MaterialIcons
                  name={selectedDevices.includes(device) ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.deviceText}>{device}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={confirmBooking}
            disabled={selectedDevices.length === 0}
            style={({ pressed }) => [
              styles.confirmButton,
              { opacity: pressed || selectedDevices.length === 0 ? 0.7 : 1 },
              selectedDevices.length === 0 && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar reserva com ${selectedDevices.length} aparelho(s) selecionado(s)`}
          >
            <Text style={styles.confirmButtonText}>
              Confirmar Reserva ({selectedDevices.length} selecionado
              {selectedDevices.length !== 1 ? 's' : ''})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setShowDeviceModal(false);
              setSelectedDevices([]);
              setSelectedTime('');
            }}
            style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}