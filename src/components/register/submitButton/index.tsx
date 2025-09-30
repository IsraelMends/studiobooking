import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import styles from './styles';

import { SubmitButtonProps } from '~/types/register/register.types';

export const SubmitButton: React.FC<SubmitButtonProps & {
  icon?: string;
}> = ({
  onPress,
  loading,
  title,
  icon,
}) => {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { 
          opacity: loading ? 0.7 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }
      ]}
    >
      <LinearGradient
        colors={loading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.loadingText}>Criando conta...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <MaterialIcons 
                name={icon as any} 
                size={20} 
                color="#ffffff" 
                style={styles.buttonIcon}
              />
            )}
            <Text style={styles.buttonText}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};
