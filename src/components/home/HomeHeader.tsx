import React from 'react';
import { Text } from 'react-native';
import styles from '../../../app/styles';
import { HomeHeaderProps } from '~/types/home/home.types';

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <Text style={styles.greeting}>
      {getGreeting()}, {userName} 👋
    </Text>
  );
};