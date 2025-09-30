import React from 'react';
import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';

import { useRegisterForm } from '~/hooks/register/useRegisterForm';
import { useOrganizations } from '~/hooks/register/useOrganizations';
import { FormField } from '../formField';
import { OrganizationPicker } from '../organizationPicker';
import { SubmitButton } from '../submitButton';
import { RegisterFormProps } from '~/types/register/register.types';
import  styles  from '../../../../app/styles';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading,
}) => {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useRegisterForm();
  const { organizations, loading: loadingOrgs } = useOrganizations();
  
  const selectedOrg = watch("organization_id");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Nome completo"
            placeholder="Seu nome"
            value={value}
            onChangeText={onChange}
            error={errors.full_name?.message}
            autoCapitalize="words"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="E-mail"
            placeholder="voce@empresa.com"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Senha"
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      <OrganizationPicker
        organizations={organizations}
        selectedValue={selectedOrg}
        onValueChange={(val) => setValue("organization_id", val)}
        loading={loadingOrgs}
        error={errors.organization_id?.message}
      />

      <SubmitButton
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        title="Registrar"
      />
    </View>
  );
};