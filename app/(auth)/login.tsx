import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '~/store/auth';

export default function Login(){
  const { register, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState<any>({ name:'', email:'', password:'', phone:'', organization:'' });
  const [error, setError] = useState<string|null>(null);

  const onSubmit = async () => {
    try {
      setError(null);
      if (isRegister) {
        await register({ name: form.name, email: form.email, phone: form.phone, organization: form.organization, password: form.password });
      } else {
        await login(form.email, form.password);
      }
    } catch (e:any) {
      setError(e.message);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor: '#0b0f13', padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 }}>{isRegister ? 'Criar conta' : 'Entrar'}</Text>
      {isRegister && (
        <TextInput placeholder='Nome' placeholderTextColor='#9aa0a6' style={styles.input} value={form.name} onChangeText={t=> setForm({...form, name:t})} />
      )}
      <TextInput placeholder='E-mail' placeholderTextColor='#9aa0a6' style={styles.input} value={form.email} onChangeText={t=> setForm({...form, email:t})} autoCapitalize='none' keyboardType='email-address' />
      <TextInput placeholder='Senha' placeholderTextColor='#9aa0a6' style={styles.input} secureTextEntry value={form.password} onChangeText={t=> setForm({...form, password:t})} />
      {isRegister && (
        <>
          <TextInput placeholder='Telefone' placeholderTextColor='#9aa0a6' style={styles.input} value={form.phone} onChangeText={t=> setForm({...form, phone:t})} />
          <TextInput placeholder='Faculdade/Empresa' placeholderTextColor='#9aa0a6' style={styles.input} value={form.organization} onChangeText={t=> setForm({...form, organization:t})} />
        </>
      )}
      {error && <Text style={{ color: 'salmon' }}>{error}</Text>}
      <Pressable onPress={onSubmit} style={styles.btn}><Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>{isRegister ? 'Registrar' : 'Entrar'}</Text></Pressable>
      <Pressable onPress={()=> setIsRegister(!isRegister)}><Text style={{ color:'#61dafb' }}>{isRegister ? 'Já tenho conta' : 'Criar conta'}</Text></Pressable>
    </View>
  );
}

const styles = {
  input: { backgroundColor:'#101114', color:'white', padding:12, borderRadius:12, marginBottom: 8 },
  btn: { backgroundColor:'#20232a', padding:12, borderRadius:12 }
} as const;
