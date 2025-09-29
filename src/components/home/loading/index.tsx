import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../../../app/styles';
import { LoadingScreenProps } from '~/types/home/home.types';

export const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={styles.loading}
      />
      <Text style={styles.loadingText}>Carregando sua agenda...</Text>
    </SafeAreaView>
  );
};