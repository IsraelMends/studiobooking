import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreenProps } from '~/types/profile/profile.types';
import { styles } from '../profile.styles';

import { MaterialIcons } from '@expo/vector-icons';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando perfil...' 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <MaterialIcons name="person" size={48} color="#9aa0a6" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};