import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { useRegisterForm } from '~/hooks/register/useRegisterForm';
import { useOrganizations } from '~/hooks/register/useOrganizations';

import { RegisterFormProps } from '~/types/register/register.types';

import { FormField } from '../formField';

import { OrganizationPicker } from '../organizationPicker';
import { SubmitButton } from '../submitButton';

import { styles } from './styles';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading,
}) => {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useRegisterForm();
  const { organizations, loading: loadingOrgs } = useOrganizations();
  
  const selectedOrg = watch("organization_id");

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header com ícone */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person-add" size={32} color="#ffffff" />
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Preencha os dados abaixo para criar sua conta
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <FormField
                  label="Nome completo"
                  placeholder="Digite seu nome completo"
                  value={value}
                  onChangeText={onChange}
                  error={errors.full_name?.message}
                  autoCapitalize="words"
                  icon="person"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormField
                  label="E-mail"
                  placeholder="seu.email@empresa.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  icon="email"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FormField
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  icon="lock"
                  helperText="Use pelo menos 6 caracteres com letras e números"
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
              title="Criar Conta"
              icon="person-add"
            />

            {/* Footer informativo */}
            <View style={styles.footer}>
              <MaterialIcons name="info" size={16} color="#9aa0a6" />
              <Text style={styles.footerText}>
                Ao criar uma conta, você concorda com nossos termos de uso
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};