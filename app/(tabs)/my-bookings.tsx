// app/(tabs)/bookings.tsx
import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { useBookings } from '~/store/booking';

type ItemProps = {
  id: string;
  date: string;        // 'YYYY-MM-DD'
  start_time: string;  // 'HH:mm' ou 'HH:mm:ss'
  status: 'active' | 'canceled';
};

function toDate(date: string, time: string) {
  const clean = (time || '').split('+')[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  return new Date(`${date}T${hhmmss}`);
}

function BookingCard({ item }: { item: ItemProps }) {
  const { cancel } = useBookings();
  const [busy, setBusy] = useState(false);

  const startDt = useMemo(() => toDate(item.date, item.start_time), [item.date, item.start_time]);
  const whenLabel = useMemo(() => format(startDt, "EEE, dd MMM yyyy — HH:mm"), [startDt]);

  const onCancel = () => {
    Alert.alert(
      'Cancelar reserva',
      'Tem certeza que deseja cancelar esta reserva?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              await cancel(item.id, 'Cancelado pelo usuário');
              // a store já recarrega a lista e a próxima reserva
            } catch (e: any) {
              const msg = String(e?.message || e);
              if (msg.includes('POLICY')) {
                Alert.alert('Atenção', 'Você não pode cancelar porque passou do limite da política de cancelamento.');
              } else if (msg.includes('FORBIDDEN')) {
                Alert.alert('Atenção', 'Você só pode cancelar as suas próprias reservas.');
              } else {
                Alert.alert('Erro', msg);
              }
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const isActive = item.status === 'active';

  return (
    <View style={{ backgroundColor:'#11161b', padding:16, borderRadius:14, marginBottom:12 }}>
      <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>{whenLabel}</Text>
      <Text style={{ color:'#9aa0a6', marginTop:6 }}>Duração: 60 min (+10 min buffer)</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop:12, alignItems:'center' }}>
        <Text
          style={{
            color: isActive ? '#10b981' : '#d1d5db',
            backgroundColor: isActive ? '#0c2b24' : '#2a2f36',
            paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:'700'
          }}
        >
          {isActive ? 'Ativa' : 'Cancelada'}
        </Text>

        {isActive && (
          <Pressable
            onPress={onCancel}
            disabled={busy}
            style={{
              marginLeft:'auto',
              backgroundColor:'#2a1b1b',
              paddingVertical:10, paddingHorizontal:14,
              borderRadius:10,
              opacity: busy ? 0.7 : 1
            }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color:'#fff', fontWeight:'800' }}>Cancelar</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function MyBookingsScreen() {
  const { myUpcoming, loadMyUpcoming } = useBookings();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMyUpcoming();
    }, [loadMyUpcoming])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMyUpcoming();
    } finally {
      setRefreshing(false);
    }
  }, [loadMyUpcoming]);

  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16 }}>
      <Text style={{ color:'#fff', fontSize:22, fontWeight:'800', marginBottom:12 }}>Minhas reservas</Text>

      <FlatList
        data={myUpcoming as any[]}
        keyExtractor={(b:any) => b.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={
          <View style={{ padding:20, backgroundColor:'#11161b', borderRadius:12 }}>
            <Text style={{ color:'#9aa0a6', marginBottom:8 }}>Você ainda não tem reservas futuras.</Text>
            <Text style={{ color:'#9aa0a6' }}>Use a aba <Text style={{ color:'#fff', fontWeight:'800' }}>Agendar</Text> para criar sua primeira reserva.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            item={{
              id: item.id,
              date: item.date,
              start_time: item.start_time,
              status: item.status,
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
