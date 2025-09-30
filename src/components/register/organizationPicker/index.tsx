import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { OrganizationPickerProps } from '~/types/register/register.types';
import  styles  from '../../../../app/styles';

export const OrganizationPicker: React.FC<OrganizationPickerProps> = ({
  organizations,
  selectedValue,
  onValueChange,
  loading,
  error,
}) => {
  return (
    <View>
      <Text style={styles.label}>Organização</Text>
      {loading ? (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <Picker
          selectedValue={selectedValue}
          onValueChange={(val) => onValueChange(String(val))}
          style={styles.picker}
          dropdownIconColor="#f9fafb"
        >
          <Picker.Item label="Selecione..." value="" color="#9CA3AF" />
          {organizations.map((org) => (
            <Picker.Item
              key={org.id}
              label={org.name}
              value={org.id}
              color="#F9FAFB"
            />
          ))}
        </Picker>
      )}
      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};