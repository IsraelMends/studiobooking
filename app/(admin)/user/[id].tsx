// app/(admin)/user/[id].tsx
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useBookings } from '~/store/booking';
import { format } from 'date-fns';
import { useAuth } from '~/store/auth';

function toDate(date: string, time: string) {
  const clean = (time || '').split('+')[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  return new Date(`${date}T${hhmmss}`);
}

function BookingRow({ item, onCancelPress }: {
  item: { id:string; date:string; start_time:string; status:'active'|'canceled'; profiles?: any };
  onCancelPress: (id:string) => Promise<void>;
}) {
  const startDt = useMemo(() => toDate(item.date, item.start_time), [item.date, item.start_time]);
  const whenLabel = useMemo(() => format(startDt, "EEE, dd MMM yyyy — HH:mm"), [startDt]);
  const [busy, setBusy] = useState(false);
  const isActive = item.status === 'active';

  const handleCancel = () => {
    Alert.alert(
      'Cancelar reserva',
      'Tem certeza que deseja cancelar esta reserva para este usuário?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              await onCancelPress(item.id);
            } catch (e:any) {
              Alert.alert('Erro', String(e?.message || e));
            } finally {
              setBusy(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ backgroundColor:'#11161b', padding:14, borderRadius:12, marginBottom:10 }}>
      <Text style={{ color:'#fff', fontWeight:'800' }}>{whenLabel}</Text>
      <Text style={{ color:'#9aa0a6', marginTop:4 }}>Status: {isActive ? 'Ativa' : 'Cancelada'}</Text>

      <View style={{ flexDirection:'row', gap:8, marginTop:12, alignItems:'center' }}>
        {!!item.profiles?.name && (
          <Text style={{ color:'#9aa0a6' }}>
            Usuário: <Text style={{ color:'#fff' }}>{item.profiles.name}</Text>
          </Text>
        )}
        <View style={{ flex:1 }} />
        {isActive && (
          <Pressable
            onPress={handleCancel}
            disabled={busy}
            style={{ backgroundColor:'#2a1b1b', paddingVertical:10, paddingHorizontal:14, borderRadius:10, opacity: busy ? 0.7 : 1 }}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'800' }}>Cancelar</Text>}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function AdminUserDetail(){
  const { id } = useLocalSearchParams<{id: string}>();
  const { profile } = useAuth();
  const { selectedUserBookings, loadBookingsByUser, adminCancel } = useBookings();

  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (id) await loadBookingsByUser(id);
  }, [id, loadBookingsByUser]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresh(); } finally { setRefreshing(false); }
  }, [refresh]);

  if (profile?.role !== 'admin') return null;

  const handleAdminCancel = async (bookingId: string) => {
    await adminCancel(bookingId, 'Cancelado pelo administrador');
    await refresh();
  };

  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16 }}>
      <Text style={{ color:'white', fontSize:20, fontWeight:'800', marginBottom:12 }}>Agendas do usuário</Text>

      <FlatList
        data={selectedUserBookings as any[]}
        keyExtractor={(b:any)=>b.id}
        renderItem={({item}) => (
          <BookingRow item={item} onCancelPress={handleAdminCancel} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View style={{ padding:20, backgroundColor:'#11161b', borderRadius:12 }}>
            <Text style={{ color:'#9aa0a6' }}>Este usuário não possui reservas futuras.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom:24 }}
      />
    </View>
  );
}
