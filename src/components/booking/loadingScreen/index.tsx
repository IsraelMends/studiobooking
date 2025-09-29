import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreenProps } from '~/types/booking/booking.types';
import { styles } from '~/components/booking/styles';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando suas reservas..." 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};