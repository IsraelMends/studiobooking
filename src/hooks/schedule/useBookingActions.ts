import { useState, useCallback } from 'react';
import { Alert, Vibration } from 'react-native';

import { createBooking } from '~/services/bookings';
import { 
  isPastDate, 
  isToday, 
  hhmmToMin, 
  nowHHMM,
  calculateEndTime,
  calculateBufferTime,
  pad 
} from '~/utils/schedule';

export const useBookingActions = (
  profile: any,
  date: string,
  setAvailable: React.Dispatch<React.SetStateAction<string[]>>,
  setDayBookings: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const devices = ['Cameras', 'Microfones', 'Tripés', 'Iluminação', 'Refletores'];

  const toggleDevice = useCallback((device: string) => {
    setSelectedDevices((prev) =>
      prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
    );
  }, []);

  const confirmBooking = useCallback(async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('Seleção Obrigatória', 'Você deve selecionar pelo menos um aparelho para continuar.');
      return;
    }

    setShowDeviceModal(false);
    setIsCreating(true);
    try {
      if (!profile || !profile.organization_id) {
        Alert.alert('Erro', 'Você precisa estar logado e ter uma organização válida para agendar.');
        setIsCreating(false);
        return;
      }

      await createBooking(
        profile.id,
        profile.organization_id,
        date,
        selectedTime,
        selectedDevices
      );

      // Atualização otimista do estado local
      setAvailable((prev) => prev.filter((t) => t !== selectedTime));

      setDayBookings((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          user_id: profile.id,
          date,
          start_time: selectedTime,
          end_time: calculateEndTime(selectedTime),
          buffer_until: calculateBufferTime(selectedTime),
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ]);

      Vibration.vibrate(100);

      Alert.alert(
        'Sucesso!',
        `Reserva criada com sucesso para ${selectedTime}. Aparelhos: ${selectedDevices.join(', ')}.`
      );
    } catch (e: any) {
      Alert.alert('Erro ao Agendar', e?.message || 'Tente novamente mais tarde.');
    } finally {
      setIsCreating(false);
      setSelectedDevices([]);
      setSelectedTime('');
    }
  }, [profile, date, selectedTime, selectedDevices, setAvailable, setDayBookings]);

  const onSlotPress = useCallback(
    async (t: string) => {
      if (!profile) {
        Alert.alert('Erro', 'Você precisa estar logado para agendar.');
        return;
      }
      if (isToday(date) && hhmmToMin(t) < hhmmToMin(nowHHMM())) {
        Alert.alert('Horário Inválido', 'Não é possível reservar para um horário já passado.');
        return;
      }
      if (isPastDate(date)) {
        Alert.alert('Data Inválida', 'Não é possível reservar em datas anteriores a hoje.');
        return;
      }

      setSelectedTime(t);
      setSelectedDevices([]);
      setShowDeviceModal(true);
    },
    [profile, date]
  );

  const cancelModal = () => {
    setShowDeviceModal(false);
    setSelectedDevices([]);
    setSelectedTime('');
  };

  return {
    isCreating,
    showDeviceModal,
    selectedTime,
    selectedDevices,
    devices,
    toggleDevice,
    confirmBooking,
    onSlotPress,
    cancelModal,
  };
};