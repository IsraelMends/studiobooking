import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../../app/styles';
import { AdminSectionProps } from '~/types/home/home.types';

export const AdminSection: React.FC<AdminSectionProps> = ({
  onNavigateToUsers,
  onNavigateToReports,
  onNavigateToDay,
  onNavigateToRegister,
  onNavigateToDelete,
}) => {
  const adminCards = [
    {
      icon: 'people',
      title: 'Gerenciar usuários & agendas',
      subtitle: 'Veja reservas de cada usuário',
      onPress: onNavigateToUsers,
      accessibilityLabel: 'Gerenciar usuários e agendas',
      accessibilityHint: 'Abre a tela de gerenciamento de usuários',
    },
    {
      icon: 'assessment',
      title: 'Gerenciar relatórios',
      subtitle: 'Veja relatórios de reservas',
      onPress: onNavigateToReports,
      accessibilityLabel: 'Gerenciar relatórios',
      accessibilityHint: 'Abre a tela de relatórios de reservas',
    },
    {
      icon: 'date-range',
      title: 'Gerenciar agenda diária',
      subtitle: 'Veja reservas por dia',
      onPress: onNavigateToDay,
      accessibilityLabel: 'Gerenciar agenda diária',
      accessibilityHint: 'Abre a tela de agenda por dia',
    },
    {
      icon: 'person',
      title: 'Criar novo usuário',
      subtitle: 'Crie um novo usuário para o sistema',
      onPress: onNavigateToRegister,
      accessibilityLabel: 'Criar novo usuário',
      accessibilityHint: 'Abre a tela de criação de novo usuário',
    },
    {
      icon: 'person',
      title: 'Deletar usuário',
      subtitle: 'Remova um usuário do sistema',
      onPress: onNavigateToDelete,
      accessibilityLabel: 'Deletar usuário',
      accessibilityHint: 'Abre a tela de deleção de usuário',
    },
  ];

  return (
    <View style={styles.adminSection}>
      <Text style={styles.sectionTitle}>Painel Admin</Text>
      <View style={styles.adminCards}>
        {adminCards.map((card, index) => (
          <Pressable
            key={index}
            onPress={card.onPress}
            style={({ pressed }) => [
              styles.adminCard,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={card.accessibilityLabel}
            accessibilityHint={card.accessibilityHint}
          >
            <MaterialIcons 
              name={card.icon as any} 
              size={24} 
              color="#ffffff" 
            />
            <View style={styles.cardContent}>
              <Text style={styles.adminCardTitle}>{card.title}</Text>
              <Text style={styles.adminCardSubtitle}>{card.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};