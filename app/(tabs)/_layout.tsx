import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '~/store/auth';

export default function TabsLayout(){
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Redirect href='/(auth)/login' />;
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='home' options={{ title: 'Home' }} />
      <Tabs.Screen name='schedule' options={{ title: 'Agendar' }} />
      <Tabs.Screen name='my-bookings' options={{ title: 'Minhas' }} />
      <Tabs.Screen name='profile' options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
