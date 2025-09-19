// app/(admin)/day.tsx
import { useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useBookings } from '~/store/booking';
import { useAuth } from '~/store/auth';
import { formatISO, format } from 'date-fns';

function toDate(date: string, time: string) {
  const clean = (time || '').split('+')[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  return new Date(`${date}T${hhmmss}`);
}

export default function AdminDay(){
  const { profile } = useAuth();
  const { dayOverview, loadDayOverview, adminCancel } = useBookings();
  const [date, setDate] = useState(() => formatISO(new Date(), { representation:'date' }));
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    await loadDayOverview(date);
  }, [date, loadDayOverview]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresh(); } finally { setRefreshing(false); }
  }, [refresh]);

  if (profile?.role !== 'admin') return null;

  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16 }}>
      <Text style={{ color:'white', fontSize:20, fontWeight:'800', marginBottom:12 }}>
        Reservas do dia — {date}
      </Text>

      {/* TROCAR POR UM DATE PICKER DA SUA PREFERÊNCIA */}
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <Pressable
          onPress={async () => { const d = new Date(date); d.setDate(d.getDate()-1); const iso = formatISO(d, {representation:'date'}); setDate(iso); await loadDayOverview(iso); }}
          style={{ backgroundColor:'#20232a', padding:10, borderRadius:10 }}
        >
          <Text style={{ color:'#fff' }}>◀︎ Dia anterior</Text>
        </Pressable>
        <Pressable
          onPress={async () => { const d = new Date(date); d.setDate(d.getDate()+1); const iso = formatISO(d, {representation:'date'}); setDate(iso); await loadDayOverview(iso); }}
          style={{ backgroundColor:'#20232a', padding:10, borderRadius:10 }}
        >
          <Text style={{ color:'#fff' }}>Próximo dia ▶︎</Text>
        </Pressable>
      </View>

      <FlatList
        data={dayOverview as any[]}
        keyExtractor={(b:any)=>b.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={
          <View style={{ padding:20, backgroundColor:'#11161b', borderRadius:12 }}>
            <Text style={{ color:'#9aa0a6' }}>Sem reservas para este dia.</Text>
          </View>
        }
        renderItem={({item})=>{
          const start = toDate(item.date, item.start_time);
          const label = format(start, "EEE, dd MMM yyyy — HH:mm");
          const isActive = item.status === 'active';
          const owner = item.profiles?.name ?? item.profiles?.email ?? 'Usuário';

          const [busy, setBusy] = useState(false);

          const handleAdminCancel = () => {
            Alert.alert('Cancelar reserva', `Cancelar a reserva de ${owner}?`, [
              { text:'Não', style:'cancel' },
              { text:'Sim, cancelar', style:'destructive', onPress: async () => {
                try {
                  setBusy(true);
                  await adminCancel(item.id, 'Cancelado pelo administrador');
                  await refresh();
                } catch(e:any) {
                  Alert.alert('Erro', String(e?.message || e));
                } finally { setBusy(false); }
              } }
            ]);
          };

          return (
            <View style={{ backgroundColor:'#11161b', padding:14, borderRadius:12, marginBottom:10 }}>
              <Text style={{ color:'#fff', fontWeight:'800' }}>{label}</Text>
              <Text style={{ color:'#9aa0a6', marginTop:4 }}>Dono: {owner}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', marginTop:10 }}>
                <Text
                  style={{
                    color: isActive ? '#10b981' : '#d1d5db',
                    backgroundColor: isActive ? '#0c2b24' : '#2a2f36',
                    paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:'700'
                  }}
                >
                  {isActive ? 'Ativa' : 'Cancelada'}
                </Text>
                <View style={{ flex:1 }} />
                {isActive && (
                  <Pressable
                    onPress={handleAdminCancel}
                    disabled={busy}
                    style={{ backgroundColor:'#2a1b1b', paddingVertical:10, paddingHorizontal:14, borderRadius:10, opacity: busy ? 0.7 : 1 }}
                  >
                    {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'800' }}>Cancelar</Text>}
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom:24 }}
      />
    </View>
  );
}
