import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { DeviceSelectionModalProps } from '~/types/schedule/schedule.types';
import styles from '../../../../app/styles';

export const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({
  visible,
  selectedTime,
  selectedDate,
  selectedDevices,
  onToggleDevice,
  onConfirm,
  onCancel,
  devices,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Selecione os Aparelhos a Utilizar</Text>
        <Text style={styles.modalSubtitle}>
          Horário: {selectedTime} | Data: {selectedDate} | Duração: 60min
        </Text>

        <View style={styles.devicesList}>
          {devices.map((device) => (
            <Pressable 
              key={device} 
              onPress={() => onToggleDevice(device)} 
              style={styles.deviceItem}
            >
              <MaterialIcons
                name={selectedDevices.includes(device) ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.deviceText}>{device}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onConfirm}
          disabled={selectedDevices.length === 0}
          style={({ pressed }) => [
            styles.confirmButton,
            { opacity: pressed || selectedDevices.length === 0 ? 0.7 : 1 },
            selectedDevices.length === 0 && styles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Confirmar reserva com ${selectedDevices.length} aparelho(s) selecionado(s)`}
        >
          <Text style={styles.confirmButtonText}>
            Confirmar Reserva ({selectedDevices.length} selecionado
            {selectedDevices.length !== 1 ? 's' : ''})
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
};