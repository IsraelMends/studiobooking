import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { fetchBookingsByMonth, bookingsToCSV } from '~/services/reports';

function pad(n:number){ return n < 10 ? '0'+n : ''+n; }
function clampMonth(n:number){ return Math.min(12, Math.max(1, n)); }

export default function Reports(){
  const now = new Date();

  // Campos como TEXTO para permitir limpar/editar sem “pular” de volta
  const [yearText, setYearText] = useState<string>(String(now.getFullYear()));
  const [monthText, setMonthText] = useState<string>(String(now.getMonth()+1)); // "1"–"12"

  const [busy, setBusy] = useState(false);

  const exportCSV = async () => {
    // Valida entradas
    const year = parseInt((yearText || '').trim(), 10);
    const month = parseInt((monthText || '').trim(), 10);

    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      Alert.alert('Ano inválido', 'Informe um ano entre 2000 e 2100.');
      return;
    }
    if (Number.isNaN(month) || month < 1 || month > 12) {
      Alert.alert('Mês inválido', 'Informe um mês entre 1 e 12.');
      return;
    }

    try {
      setBusy(true);

      const data = await fetchBookingsByMonth(year, month);

      // Gera CSV + BOM (melhor compatibilidade Excel)
      const csv = '\ufeff' + bookingsToCSV(data);

      const filename = `reservas_${year}-${pad(month)}.csv`;

      // 🚀 Nova API do File System (SDK 54+)
      const file = new File(Paths.cache, filename);
      try {
        // cria se não existir; se já existir pode lançar — seguimos para write()
        file.create();
      } catch (_) {}
      // write sobrescreve o conteúdo
      file.write(csv);

      const uri = file.uri;

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: Platform.OS === 'android' ? 'text/csv' : undefined,
          UTI: Platform.OS === 'ios' ? 'public.comma-separated-values-text' : undefined,
          dialogTitle: 'Exportar CSV',
        });
      } else {
        Alert.alert('Exportado', `Arquivo salvo (cache do app):\n${uri}`);
      }
    } catch (e:any) {
      Alert.alert('Erro ao exportar', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#0b0f13' }}>
      <View style={{ flex:1, backgroundColor:'#0b0f13', padding:16, gap:12 }}>
        <Text style={{ color:'white', fontSize:22, fontWeight:'700' }}>Relatórios (CSV)</Text>
        <Text style={{ color:'#9aa0a6' }}>Escolha o mês e gere o CSV das reservas.</Text>

        <View style={{ flexDirection:'row', gap:8 }}>
          <TextInput
            style={styles.input}
            value={yearText}
            onChangeText={setYearText}
            keyboardType="numeric"
            placeholder="Ano (YYYY)"
            placeholderTextColor="#9aa0a6"
            maxLength={4}
            onBlur={() => {
              if (!yearText.trim()) setYearText(String(now.getFullYear()));
            }}
          />

          <TextInput
            style={styles.input}
            value={monthText}
            onChangeText={setMonthText}
            keyboardType="numeric"
            placeholder="Mês (1-12)"
            placeholderTextColor="#9aa0a6"
            maxLength={2}
            onBlur={() => {
              if (!monthText.trim()) {
                setMonthText(String(now.getMonth()+1));
                return;
              }
              const n = parseInt(monthText, 10);
              if (!Number.isNaN(n)) setMonthText(String(clampMonth(n)));
            }}
          />
        </View>

        <Pressable disabled={busy} onPress={exportCSV} style={[styles.btn, busy && {opacity:0.7}]}>
          <Text style={styles.btnText}>{busy ? 'Gerando...' : 'Exportar CSV do mês'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    flex:1,
    backgroundColor:'#101114',
    color:'white',
    padding:12,
    borderRadius:12
  },
  btn: {
    backgroundColor:'#20232a',
    padding:14,
    borderRadius:12,
    alignItems:'center',
    marginTop:8
  },
  btnText: { color:'white', fontWeight:'700' },
} as const;
