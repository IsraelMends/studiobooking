import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useSettings } from '~/store/settings';

export default function AdminSettings(){
  const { settings, blocks, load, save, addBlock, removeBlock } = useSettings();
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [cancelHours, setCancelHours] = useState(6);
  const [bDate, setBDate] = useState('');    // YYYY-MM-DD
  const [bStart, setBStart] = useState('');  // HH:mm
  const [bFinish, setBFinish] = useState('');// HH:mm
  const [bReason, setBReason] = useState(''); 

  useEffect(()=>{ load(); }, []);
  useEffect(()=>{
    if (!settings) return;
    setOpenTime(settings.openTime.slice(0,5));
    setCloseTime(settings.closeTime.slice(0,5));
    setCancelHours(settings.cancelPolicyHours);
  }, [settings]);

  const onSave = async () => {
    try {
      await save({ openTime: openTime + ':00', closeTime: closeTime + ':00', cancelPolicyHours: cancelHours });
      Alert.alert('Salvo', 'Configurações atualizadas.');
    } catch(e:any){ Alert.alert('Erro', e.message); }
  };

  const onAddBlock = async () => {
    if (!bDate) return Alert.alert('Valide', 'Informe a data (YYYY-MM-DD)');
    try {
      await addBlock({ date: bDate, start: bStart ? bStart+':00' : undefined, finish: bFinish ? bFinish+':00' : undefined, reason: bReason || undefined });
      setBDate(''); setBStart(''); setBFinish(''); setBReason('');
    } catch(e:any){ Alert.alert('Erro', e.message); }
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor:'#0b0f13' }} contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ color:'white', fontSize:22, fontWeight:'700' }}>Configurações</Text>

      <Text style={styles.label}>Janela de funcionamento</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput style={styles.input} value={openTime} onChangeText={setOpenTime} placeholder="Abertura HH:mm" placeholderTextColor="#9aa0a6" />
        <TextInput style={styles.input} value={closeTime} onChangeText={setCloseTime} placeholder="Fechamento HH:mm" placeholderTextColor="#9aa0a6" />
      </View>

      <Text style={styles.label}>Política de cancelamento (horas)</Text>
      <TextInput style={styles.input} value={String(cancelHours)} onChangeText={t=> setCancelHours(parseInt(t||'6')||6)} keyboardType="numeric" />

      <Pressable onPress={onSave} style={styles.btn}><Text style={styles.btnText}>Salvar</Text></Pressable>

      <View style={{ height:1, backgroundColor:'#222', marginVertical:12 }} />

      <Text style={{ color:'white', fontSize:18, fontWeight:'700' }}>Fechamentos/Bloqueios</Text>
      <Text style={{ color:'#9aa0a6', marginBottom:8 }}>Preencha a data e, se quiser, um intervalo. Sem intervalo = dia todo.</Text>
      <TextInput style={styles.input} value={bDate} onChangeText={setBDate} placeholder="Data (YYYY-MM-DD)" placeholderTextColor="#9aa0a6" />
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput style={styles.input} value={bStart} onChangeText={setBStart} placeholder="Início HH:mm (opcional)" placeholderTextColor="#9aa0a6" />
        <TextInput style={styles.input} value={bFinish} onChangeText={setBFinish} placeholder="Fim HH:mm (opcional)" placeholderTextColor="#9aa0a6" />
      </View>
      <TextInput style={styles.input} value={bReason} onChangeText={setBReason} placeholder="Motivo (opcional)" placeholderTextColor="#9aa0a6" />
      <Pressable onPress={onAddBlock} style={styles.btn}><Text style={styles.btnText}>Adicionar bloqueio</Text></Pressable>

      {blocks.map((b:any)=> (
        <View key={(b.id||b.date)+(b.start||'')+(b.finish||'')} style={{ backgroundColor:'#101114', padding:12, borderRadius:12, marginTop:8 }}>
          <Text style={{ color:'white' }}>{b.date} {b.start? b.start.slice(0,5):''}{b.finish? '–'+b.finish.slice(0,5):''}</Text>
          {b.reason && <Text style={{ color:'#9aa0a6' }}>{b.reason}</Text>}
          {b.id && <Pressable onPress={()=> removeBlock(b.id)} style={{ marginTop:6 }}><Text style={{ color:'#61dafb' }}>Remover</Text></Pressable>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = {
  input: { backgroundColor:'#101114', color:'white', padding:12, borderRadius:12, marginBottom:8, flex:1 },
  btn: { backgroundColor:'#20232a', padding:12, borderRadius:12, alignItems:'center' },
  btnText: { color:'white', fontWeight:'700' },
  label: { color:'white', marginTop:4, marginBottom:4 }
} as const;
