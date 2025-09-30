import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SubmitButtonProps } from '~/types/register/register.types';
import  styles  from '../../../../app/styles';

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onPress,
  loading,
  title,
}) => {
  return (
    <TouchableOpacity
      disabled={loading}
      onPress={onPress}
      style={[styles.button, loading && { opacity: 0.6 }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};