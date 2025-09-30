import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from '@expo/vector-icons';

import styles from './styles';

import { OrganizationPickerProps } from '~/types/register/register.types';

export const OrganizationPicker: React.FC<OrganizationPickerProps> = ({
  organizations,
  selectedValue,
  onValueChange,
  loading,
  error,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Organização</Text>
      
      <View style={[styles.pickerContainer, error && styles.pickerError]}>
        <MaterialIcons 
          name="business" 
          size={20} 
          color="#9ca3af" 
          style={styles.pickerIcon}
        />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.loadingText}>Carregando organizações...</Text>
          </View>
        ) : (
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#667eea"
          >
            <Picker.Item 
              label="Selecione sua organização..." 
              value="" 
              color="#9ca3af" 
            />
            {organizations.map((org) => (
              <Picker.Item
                key={org.id}
                label={org.name}
                value={org.id}
                color="#111827"
              />
            ))}
          </Picker>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

