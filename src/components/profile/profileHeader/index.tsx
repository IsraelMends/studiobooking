import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { ProfileHeaderProps } from '~/types/profile/profile.types';
import { styles } from '../profile.styles';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={40} color="#ffffff" />
        </View>
        <View style={styles.statusIndicator} />
      </View>

      <Text style={styles.userName}>
        {profile.name ?? 'Usuário'}
      </Text>
      <Text style={styles.userEmail}>
        {profile.email ?? 'sem e-mail'}
      </Text>
    </LinearGradient>
  );
};