import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Animated } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import styles from './styles';

import { FormFieldProps } from '~/types/register/register.types';

export const FormField: React.FC<FormFieldProps & {
  icon?: string;
  helperText?: string;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  icon,
  helperText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#ef4444' : '#e5e7eb', error ? '#ef4444' : '#667eea'],
  });

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={20} 
            color={isFocused ? '#667eea' : '#9ca3af'} 
            style={styles.inputIcon}
          />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor="#9ca3af"
          selectionColor="#667eea"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color="#9ca3af"
            />
          </Pressable>
        )}
      </Animated.View>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

