import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AvailableSlotsProps } from '~/types/schedule/schedule.types';
import { EmptyState } from '../enptyState';
import styles from '../../../../app/styles';

export const AvailableSlots: React.FC<AvailableSlotsProps> = ({
  date,
  slots,
  isCreating,
  showDeviceModal,
  onSlotPress,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Horários Disponíveis ({date})</Text>
      <View style={styles.slotsContainer}>
        {slots.length > 0 ? (
          slots.map((t) => (
            <Pressable
              key={t}
              onPress={() => onSlotPress(t)}
              disabled={isCreating || showDeviceModal}
              style={({ pressed }) => [
                styles.slotButton,
                { opacity: pressed || isCreating || showDeviceModal ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Agendar para ${t} - Duração 60 minutos`}
              accessibilityHint="Toque para reservar este horário"
            >
              <MaterialIcons name="access-time" size={16} color="#ffffff" />
              <Text style={styles.slotText}>{t} – 60min</Text>
              <Text style={styles.slotBuffer}>+10min buffer</Text>
            </Pressable>
          ))
        ) : (
          <EmptyState
            title="Sem Horários Disponíveis"
            subtitle="Este dia está lotado ou já passou. Escolha outra data no calendário."
            iconName="event-busy"
          />
        )}
      </View>
    </>
  );
};