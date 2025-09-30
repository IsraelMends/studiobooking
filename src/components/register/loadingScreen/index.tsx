import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LoadingScreenProps } from '~/types/register/register.types';
import  styles  from '../../../../app/styles';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};