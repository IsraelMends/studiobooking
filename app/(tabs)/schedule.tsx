import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { buildAvailableSlots } from '~/utils/dates';
import { useSettings } from '~/store/settings';
import { fetchDayBookings, createBooking } from '~/services/bookings';
import { useAuth } from '~/store/auth';
import { Card, EmptyState } from '~/components/UI';

export default function Schedule(){
  const { settings, blocks, load } = useSettings();
  const { profile } = useAuth();
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [available, setAvailable] = useState<string[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);

  useEffect(()=> { load(); }, []);
  useEffect(()=>{
    (async () => {
      if (!settings) return;
      const b = await fetchDayBookings(date);
      setDayBookings(b);
      const mapped = b.map((x:any)=> ({
        id: x.id,
        userId: x.user_id,
        date: x.date,
        startTime: x.start_time,
        endTime: x.end_time,
        bufferUntil: x.buffer_until,
        status: x.status,
        createdAt: x.created_at
      }));
      const av = buildAvailableSlots(date, settings.openTime, settings.closeTime, mapped as any, blocks as any);
      setAvailable(av);
    })();
  }, [date, settings, blocks]);

  const onPick = async (t: string) => {
    if (!profile) return;
    try {
      await createBooking(profile.id, date, t);
      const b = await fetchDayBookings(date);
      setDayBookings(b);
      const mapped = b.map((x:any)=> ({
        id: x.id,
        userId: x.user_id,
        date: x.date,
        startTime: x.start_time,
        endTime: x.end_time,
        bufferUntil: x.buffer_until,
        status: x.status,
        createdAt: x.created_at
      }));
      setAvailable(buildAvailableSlots(date, settings!.openTime, settings!.closeTime, mapped as any, blocks as any));
      alert('Reserva criada!');
    } catch (e: any) {
      alert('Erro ao criar: ' + e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b0f13', flexGrow: 1 }}>
      <Calendar onDayPress={(d)=> setDate(d.dateString)} markedDates={{ [date]: { selected: true } }}
        theme={{ calendarBackground: '#0b0f13', dayTextColor: 'white', monthTextColor: 'white', textDisabledColor: '#555' }}
      />
      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: 'white' }}>Horários disponíveis</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {available.map((t) => (
          <Pressable key={t} style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#20232a', borderRadius: 12 }} onPress={()=> onPick(t)}>
            <Text style={{ color: 'white' }}>{t}–(60m)</Text>
            <Text style={{ color: '#9aa0a6', fontSize: 12 }}>+10min buffer</Text>
          </Pressable>
        ))}
        {available.length === 0 && (
          <EmptyState title='Sem horários' subtitle='Escolha outro dia' />
        )}
      </View>
      <Card title='Reservas do dia' />
      {dayBookings.map((b)=> (
        <View key={b.id} style={{ backgroundColor: '#101114', padding: 12, borderRadius: 12, marginTop: 8 }}>
          <Text style={{ color: 'white' }}>{b.start_time}–{b.end_time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
