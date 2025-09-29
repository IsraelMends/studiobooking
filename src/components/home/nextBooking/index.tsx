import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../../../../app/styles';
import { NextBookingCardProps } from '~/types/home/home.types';

export const NextBookingCard: React.FC<NextBookingCardProps> = ({
  myNext,
  onViewAgenda,
  onScheduleNew,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="event" size={20} color="#9aa0a6" />
        <Text style={styles.cardTitle}>Sua próxima agenda</Text>
      </View>
      
      {myNext ? (
        <>
          <Text style={styles.nextBookingDate}>
            {format(
              new Date(`${myNext.date}T${myNext.start_time}`),
              "EEE, dd MMM yyyy — HH:mm",
              { locale: ptBR }
            )}
          </Text>
          <Text style={styles.durationText}>
            Duração: 60 min (+10 min buffer)
          </Text>
          <Pressable
            onPress={onViewAgenda}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Ver agenda completa"
            accessibilityHint="Navega para a tela de minhas agendas"
          >
            <MaterialIcons name="calendar-today" size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Ver Minha Agenda</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.noBookingText}>
            Você ainda não tem reservas futuras. Que tal agendar uma?
          </Text>
          <Pressable
            onPress={onScheduleNew}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Agendar uma nova reserva"
            accessibilityHint="Navega para a tela de agendamento"
          >
            <MaterialIcons name="add" size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Agendar agora</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};