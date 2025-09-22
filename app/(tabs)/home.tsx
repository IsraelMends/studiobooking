// app/(tabs)/home.tsx
import { useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { useBookings } from '../../src/store/booking';
import { useAuth } from '../../src/store/auth';

import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { format } from 'date-fns';

export default function Home(){
  const { myNext, loadMyNext } = useBookings();
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => { loadMyNext(); }, []);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#0b0f13', padding:16, gap:16 }}>
      <Text style={{ color:'white', fontSize:22, fontWeight:'800' }}>Olá, {profile?.name?.split(' ')[0] ?? 'bem-vindo'} 👋</Text>

      {/* Card Próxima Agenda */}
      <View style={{ backgroundColor:'#11161b', borderRadius:16, padding:16 }}>
        <Text style={{ color:'#9aa0a6', marginBottom:6, fontWeight:'700' }}>Sua próxima agenda</Text>
        {myNext ? (
          <>
            <Text style={{ color:'white', fontSize:18, fontWeight:'700' }}>
              {format(new Date(`${myNext.date}T${myNext.start_time}`), "EEE, dd MMM yyyy — HH:mm")}
            </Text>
            <Text style={{ color:'#9aa0a6', marginTop:4 }}>Duração: 60 min (+10 min buffer)</Text>
            <Pressable onPress={()=> router.push('/(tabs)/schedule')}
              style={{ marginTop:12, backgroundColor:'#20232a', padding:12, borderRadius:12 }}>
              <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Ver Agenda</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ color:'#9aa0a6' }}>Você ainda não tem reservas futuras.</Text>
            <Pressable onPress={()=> router.push('/(tabs)/schedule')}
              style={{ marginTop:12, backgroundColor:'#20232a', padding:12, borderRadius:12 }}>
              <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Agendar agora</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Se admin, atalho para lista completa */}
      {profile?.role === 'admin' && (
        <Pressable onPress={()=> router.push('/(admin)/users')}
          style={{ backgroundColor:'#1a2a33', borderRadius:16, padding:16 }}>
          <Text style={{ color:'white', fontWeight:'800', fontSize:16 }}>Gerenciar usuários & agendas</Text>
          <Text style={{ color:'#9aa0a6', marginTop:4 }}>Veja reservas de cada usuário</Text>
        </Pressable>
      )}

      {profile?.role === 'admin' && (
        <Pressable onPress={()=> router.push('/admin/reports')}
          style={{ backgroundColor:'#1a2a33', borderRadius:16, padding:16 }}>
          <Text style={{ color:'white', fontWeight:'800', fontSize:16 }}>Gerenciar relatórios</Text>
          <Text style={{ color:'#9aa0a6', marginTop:4 }}>Veja relatórios de reservas</Text>
        </Pressable>
      )}

      {profile?.role === 'admin' && (
        <Pressable onPress={()=> router.push('/(admin)/day')}
          style={{ backgroundColor:'#1a2a33', borderRadius:16, padding:16 }}>
          <Text style={{ color:'white', fontWeight:'800', fontSize:16 }}>Gerenciar agenda diária</Text>
          <Text style={{ color:'#9aa0a6', marginTop:4 }}>Veja reservas por dia</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
  useFocusEffect(useCallback(() => {
    loadMyNext();
  }, [loadMyNext]));
}
