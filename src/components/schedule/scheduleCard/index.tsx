import React from 'react';
import { View, Text } from 'react-native';

import { CardProps } from '~/types/schedule/schedule.types';
import styles from '../../../../app/styles';

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
};