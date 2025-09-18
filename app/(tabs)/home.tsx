import { View, Text } from 'react-native';
import { useAuth } from '~/store/auth';
import { Card } from '~/components/UI';

export default function Home(){
  const { profile } = useAuth();
  return (
    <View style={{ padding: 16, gap: 12, backgroundColor: '#0b0f13', flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', color: 'white' }}>Olá, {profile?.name?.split(' ')[0]} 👋</Text>
      <Card title='Resumo do mês passado' subtitle='Total de reservas' value='--' />
      {profile?.role === 'admin' && (
        <Card title='Mês atual (global)' subtitle='Reservas' value='--' ctaLabel='Ver todas' onPress={()=>{}} />
      )}
      <Card title='Sua próxima reserva' subtitle='Data e horário' value='--' />
    </View>
  );
}
