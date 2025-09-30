import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ProfileStatsProps } from '~/types/profile/profile.types';
import { styles } from '../profile.styles';

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  lastAccess,
  status,
}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <MaterialIcons name="access-time" size={20} color="#9aa0a6" />
        <Text style={styles.statLabel}>Último acesso</Text>
        <Text style={styles.statValue}>{lastAccess}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <MaterialIcons name="security" size={20} color="#9aa0a6" />
        <Text style={styles.statLabel}>Status</Text>
        <Text style={styles.statValue}>{status}</Text>
      </View>
    </View>
  );
};