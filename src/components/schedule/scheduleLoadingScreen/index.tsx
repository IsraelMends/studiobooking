import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreenProps } from '~/types/schedule/schedule.types';
import styles from '../../../../app/styles';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando calendário...' 
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