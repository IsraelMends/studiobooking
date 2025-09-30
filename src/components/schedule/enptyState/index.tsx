import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EmptyStateProps } from '~/types/schedule/schedule.types';
import styles from '../../../../app/styles';

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  iconName = 'event-busy',
}) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name={iconName as any} size={48} color="#9aa0a6" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
};