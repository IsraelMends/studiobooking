// app/(tabs)/profile.tsx
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '~/store/auth';

export default function Profile(){
  const { profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16, gap:16 }}>
      <View style={{ backgroundColor:'#11161b', borderRadius:16, padding:16 }}>
        <Text style={{ color:'white', fontSize:22, fontWeight:'800' }}>{profile?.name}</Text>
        <Text style={{ color:'#9aa0a6', marginTop:4 }}>{profile?.email}</Text>
        {profile?.organization ? (
          <Text style={{ color:'#9aa0a6', marginTop:2 }}>Faculdade/Empresa: {profile.organization}</Text>
        ) : null}
        <View style={{ marginTop:12, flexDirection:'row', gap:8 }}>
          <Text style={{ color: isAdmin ? '#10b981' : '#61dafb', fontWeight:'800', backgroundColor:isAdmin? '#0c2b24' : '#11202a', paddingHorizontal:10, paddingVertical:4, borderRadius:999 }}>
            {isAdmin ? 'Administrador' : 'Usuário'}
          </Text>
        </View>
      </View>

      <Pressable onPress={logout}
        style={{ backgroundColor:'#20232a', padding:14, borderRadius:12 }}>
        <Text style={{ color:'white', textAlign:'center', fontWeight:'800' }}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}
