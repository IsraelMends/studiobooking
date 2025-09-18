import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/store/auth';
import { useSettings } from '~/store/settings';
import { cancelBooking } from '~/services/bookings';
import { EmptyState } from '~/components/UI';

export default function MyBookings(){
  const { profile } = useAuth();
  const { settings } = useSettings();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!profile) return;
    const { data } = await supabase.from('bookings').select('*')
      .eq('user_id', profile.id)
      .eq('status','active')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    setItems(data ?? []);
  };

  useEffect(()=>{ load(); }, [profile]);

  const onCancel = async (b: any) => {
    const startsAtISO = b.date + 'T' + b.start_time;
    try { await cancelBooking(b.id, 'user', startsAtISO, settings?.cancelPolicyHours ?? 6); await load(); alert('Cancelado.'); }
    catch (e:any) { alert('Não foi possível cancelar: ' + e.message); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b0f13', flexGrow: 1 }}>
      {items.length === 0 && <EmptyState title='Você ainda não tem reservas' subtitle='Toque em Agendar' />}
      {items.map((b)=> (
        <View key={b.id} style={{ backgroundColor: '#101114', padding: 12, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: 'white' }}>{b.date} — {b.start_time}–{b.end_time}</Text>
          <Pressable onPress={()=> onCancel(b)} style={{ marginTop: 6 }}><Text style={{ color: '#61dafb' }}>Cancelar</Text></Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
