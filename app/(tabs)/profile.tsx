import { View, Text, Pressable } from 'react-native';
import { useAuth } from '~/store/auth';
import { Badge } from '~/components/UI';
import { useRouter } from 'expo-router';

export default function Profile(){
  const { profile, logout } = useAuth();
  const router = useRouter();
  return (
    <View style={{ padding: 16, gap: 10, backgroundColor: '#0b0f13', flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>{profile?.name}</Text>
      <Text style={{ color: 'white' }}>{profile?.email}</Text>
      {profile?.phone && <Text style={{ color: 'white' }}>{profile?.phone}</Text>}
      {profile?.organization && <Text style={{ color: 'white' }}>{profile?.organization}</Text>}
      {profile?.role === 'admin' && <Badge>Administrador</Badge>}

      {profile?.role === 'admin' && (
        <View style={{ gap:8, marginTop:8 }}>
          <Pressable onPress={()=> router.push('/admin/settings')} style={{ padding: 12, backgroundColor: '#20232a', borderRadius: 12 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Gerenciar horários/fechamentos</Text>
          </Pressable>
          <Pressable onPress={()=> router.push('/admin/reports')} style={{ padding: 12, backgroundColor: '#20232a', borderRadius: 12 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Relatórios (CSV)</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={logout} style={{ padding: 12, backgroundColor: '#20232a', borderRadius: 12, marginTop: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Sair</Text>
      </Pressable>
    </View>
  );
}
