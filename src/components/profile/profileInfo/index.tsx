import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ProfileInfoProps } from '~/types/profile/profile.types';
import { styles } from '../profile.styles';

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  profile,
  orgLabel,
  isAdmin,
}) => {
  return (
    <View style={styles.profileInfo}>
      {/* Card da organização */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialIcons name="business" size={24} color="#667eea" />
          <Text style={styles.infoTitle}>Organização</Text>
        </View>
        <Text style={styles.infoValue}>{orgLabel}</Text>
      </View>

      {/* Card do tipo de usuário */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialIcons
            name={isAdmin ? 'admin-panel-settings' : 'person'}
            size={24}
            color={isAdmin ? '#10b981' : '#667eea'}
          />
          <Text style={styles.infoTitle}>Tipo de Conta</Text>
        </View>
        <View style={styles.roleContainer}>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isAdmin ? '#ecfdf5' : '#eff6ff',
                borderColor: isAdmin ? '#10b981' : '#667eea',
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isAdmin ? '#10b981' : '#667eea' },
              ]}
            >
              {isAdmin ? 'Administrador' : 'Usuário'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};