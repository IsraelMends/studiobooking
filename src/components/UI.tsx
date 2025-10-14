import React from 'react';
import { View, Text, Pressable } from 'react-native';
export function Card({ title, subtitle, value, ctaLabel, onPress }: any){
  return (
    <View style={{ borderRadius: 16, padding: 16, backgroundColor: '#101114', gap: 6 }}>
      {subtitle && <Text style={{ color: '#9aa0a6' }}>{subtitle}</Text>}
      {title && <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{title}</Text>}
      {value != null && <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>{value}</Text>}
      {ctaLabel && <Pressable onPress={onPress}><Text style={{ color: '#61dafb' }}>{ctaLabel}</Text></Pressable>}
    </View>
  );
}
export function EmptyState({ title, subtitle }: any){
  return (
    <View style={{ alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>{title}</Text>
      {subtitle && <Text style={{ color: '#9aa0a6', marginTop: 4 }}>{subtitle}</Text>}
    </View>
  );
}
export function Badge({ children }: any){
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}
