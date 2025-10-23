import React from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ProfileActionsProps } from '~/types/profile/profile.types';
import { styles } from '../profile.styles';

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onEditProfile,
  onLogout,
}) => {
  const handleEditProfile = () => {
    Alert.alert('Em desenvolvimento', 'A seção de perfil ainda está em desenvolvimento.');
    // onEditProfile?.();
  };

  return (
    <View style={styles.actionsContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          styles.editButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleEditProfile}
      >
        <MaterialIcons name="edit" size={20} color="#667eea" />
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [
          styles.actionButton,
          styles.logoutButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <MaterialIcons name="logout" size={20} color="#ffffff" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </Pressable>
    </View>
  );
};
