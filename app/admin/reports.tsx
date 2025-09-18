import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fetchBookingsByMonth, bookingsToCSV } from '~/services/reports';

function pad(n:number){ return n < 10 ? '0'+n : ''+n; }

export default function Reports(){
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth()+1); // 1-12
  const [busy, setBusy] = useState(false);

  const exportCSV = async () => {
    try {
      setBusy(true);
      const data = await fetchBookingsByMonth(year, month);
      const csv = bookingsToCSV(data);
      const uri = FileSystem.cacheDirectory + `reservas_${year}-${pad(month)}.csv`;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar CSV' });
      } else {
        Alert.alert('Exportado', 'Arquivo salvo em cache: ' + uri);
      }
    } catch (e:any) {
      Alert.alert('Erro', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16, gap:12 }}>
      <Text style={{ color:'white', fontSize:22, fontWeight:'700' }}>Relatórios (CSV)</Text>
      <Text style={{ color:'#9aa0a6' }}>Escolha o mês e gere o CSV das reservas.</Text>

      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput
          style={styles.input}
          value={String(year)}
          onChangeText={t=> setYear(parseInt(t||String(year))||year)}
          keyboardType="numeric"
          placeholder="Ano (YYYY)"
          placeholderTextColor="#9aa0a6"
        />
        <TextInput
          style={styles.input}
          value={String(month)}
          onChangeText={t=> {
            const v = parseInt(t||String(month))||month;
            setMonth(Math.min(12, Math.max(1, v)));
          }}
          keyboardType="numeric"
          placeholder="Mês (1-12)"
          placeholderTextColor="#9aa0a6"
        />
      </View>

      <Pressable disabled={busy} onPress={exportCSV} style={[styles.btn, busy && {opacity:0.7}]}>
        <Text style={styles.btnText}>{busy ? 'Gerando...' : 'Exportar CSV do mês'}</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  input: { flex:1, backgroundColor:'#101114', color:'white', padding:12, borderRadius:12 },
  btn: { backgroundColor:'#20232a', padding:14, borderRadius:12, alignItems:'center', marginTop:8 },
  btnText: { color:'white', fontWeight:'700' },
} as const;
