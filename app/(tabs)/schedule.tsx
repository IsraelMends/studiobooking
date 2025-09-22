import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buildAvailableSlots } from '~/utils/dates';
import { useSettings } from '~/store/settings';

import { fetchDayBookings, createBooking } from '~/services/bookings';
import { useAuth } from '~/store/auth';
import { Card, EmptyState } from '~/components/UI';


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

export default function Schedule() {
  const { settings, blocks, load } = useSettings();
  const { profile } = useAuth();

  const today = toLocalDateString();
  const [date, setDate] = useState<string>(today);
  const [available, setAvailable] = useState<string[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      if (!settings) return;

      // Se por algum motivo a data cair no passado, não carrega nada
      if (isPastDate(date)) {
        setAvailable([]);
        setDayBookings([]);
        return;
      }

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
        createdAt: x.created_at
      }));

      // Constrói os horários
      let av = buildAvailableSlots(
        date,
        settings.openTime,
        settings.closeTime,
        mapped as any,
        blocks as any
      ) as string[];

      // Se a data é hoje, filtra horários anteriores ao agora
      if (isToday(date)) {
        const now = nowHHMM();
        av = av.filter(t => t >= now);
      }

      setAvailable(av);
    })();
  }, [date, settings, blocks]);

  const onPick = async (t: string) => {
    if (!profile) return;

    // Impede tentativa de reservar passado (ex.: se a lista mudar por race condition)
    if (isToday(date) && t < nowHHMM()) {
      Alert.alert('Horário inválido', 'Não é possível reservar para um horário já passado.');
      return;
    }
    if (isPastDate(date)) {
      Alert.alert('Data inválida', 'Não é possível reservar em datas anteriores a hoje.');
      return;
    }

    try {
      await createBooking(profile.id, date, t);

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
        createdAt: x.created_at
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
        av = av.filter(t => t >= now);
      }

      setAvailable(av);
      Alert.alert('Sucesso', 'Reserva criada!');
    } catch (e: any) {
      Alert.alert('Erro', 'Erro ao criar: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f13' }}>

    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b0f13', flexGrow: 1 }}>
      <Calendar
        // Impede visualmente a seleção de datas passadas
        minDate={today}
        onDayPress={(d) => {
          // Se tentar tocar em dia desabilitado (ou por segurança), não faz nada
          if (isPastDate(d.dateString)) return;
          setDate(d.dateString);
        }}
        markedDates={{ [date]: { selected: true } }}
        theme={{
          calendarBackground: '#0b0f13',
          dayTextColor: 'white',
          monthTextColor: 'white',
          textDisabledColor: '#555'
        }}
      />

      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: 'white' }}>
        Horários disponíveis
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {available.map((t) => (
          <Pressable
            key={t}
            style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#20232a', borderRadius: 12 }}
            onPress={() => onPick(t)}
          >
            <Text style={{ color: 'white' }}>{t}–(60m)</Text>
            <Text style={{ color: '#9aa0a6', fontSize: 12 }}>+10min buffer</Text>
          </Pressable>
        ))}

        {available.length === 0 && (
          <EmptyState title='Sem horários' subtitle='Escolha outro dia' />
        )}
      </View>

      <Card title='Reservas do dia' />
      {dayBookings.map((b) => (
        <View key={b.id} style={{ backgroundColor: '#101114', padding: 12, borderRadius: 12, marginTop: 8 }}>
          <Text style={{ color: 'white' }}>{b.start_time}–{b.end_time}</Text>
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}