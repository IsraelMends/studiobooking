// app/+not-found.tsx
import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFound() {
  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', alignItems:'center', justifyContent:'center', padding:16 }}>
      <Text style={{ color:'white', fontSize:18, fontWeight:'700', marginBottom:8 }}>Página não encontrada</Text>
      <Text style={{ color:'#9aa0a6', marginBottom:16 }}>A rota acessada não existe.</Text>
      <Link href="/" style={{ color:'#61dafb', fontWeight:'700' }}>Ir para a Home</Link>
    </View>
  );
}
