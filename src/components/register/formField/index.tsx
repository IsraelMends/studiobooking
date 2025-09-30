import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { FormFieldProps } from '~/types/register/register.types';
import  styles  from '../../../../app/styles';

export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        selectionColor="#2563eb"
      />
      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};