import React, { useMemo, useState } from "react";
import {
  View, Text, TextInput, Pressable, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons as Icon } from "@expo/vector-icons";

import { styles } from "./styles";
import { useAuth } from "~/store/auth";
import { supabase } from "~/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido").max(20),
  organization: z.string().min(2, "Informe a faculdade/empresa"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  confirm: z.string().min(6, "Confirme a senha"),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"], message: "As senhas não conferem",
});
type FormData = z.infer<typeof schema>;

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

export default function AdminRegisterUser() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { setValue, watch, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", organization: "", password: "", confirm: "" },
    mode: "onBlur",
  });
  const values = watch();
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() =>
    !loading &&
    values.name.length >= 2 &&
    /\S+@\S+\.\S+/.test(values.email) &&
    values.organization.length >= 2 &&
    values.password.length >= 6 &&
    values.password === values.confirm
  , [loading, values]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockedCard}>
          <Icon name="lock" size={40} color="#9aa0a6" />
          <Text style={styles.blockedTitle}>Acesso restrito</Text>
          <Text style={styles.blockedText}>Apenas administradores podem criar novos usuários.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // 1) Criar usuário NO AUTH (não troca a sessão do admin se email precisa confirmar)
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          // redirecionamento do link de confirmação (se usar magic link/confirm email)
          emailRedirectTo: "https://seu-dominio.app/confirm", // opcional
          data: { name: data.name }, // user_metadata inicial (o trigger já usa)
        },
      });
      if (signUpErr) throw signUpErr;

      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        // Em projetos com confirmação por e-mail, o user pode existir sem session
        // O ID normalmente vem; se não vier, tente buscar por e-mail (fallback raro).
        throw new Error("Não foi possível obter o ID do novo usuário.");
      }

      // 2) Atualizar PERFIL do novo usuário (admin tem permissão via RLS)
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone.replace(/\D/g, ""),
          organization: data.organization,
          role: "user",
        })
        .eq("id", newUserId);
      if (upErr) throw upErr;

      reset();
      Alert.alert(
        "Usuário criado",
        `O usuário ${data.name} foi criado com sucesso.\n\nE-mail: ${data.email}`
      );
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (
        msg.toLowerCase().includes("user already registered") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("duplicate")
      ) {
        Alert.alert("E-mail já cadastrado", "Este e-mail já está em uso.");
      } else {
        Alert.alert("Erro ao criar usuário", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Cadastrar novo usuário</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo. O usuário será criado com papel <Text style={{ fontWeight: "800", color: "#fff" }}>padrão</Text>.
          </Text>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Ex.: Maria da Silva"
              placeholderTextColor="#6b7280"
              value={values.name}
              onChangeText={(t) => setValue("name", t, { shouldValidate: true })}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="email@exemplo.com"
              placeholderTextColor="#6b7280"
              value={values.email}
              onChangeText={(t) => setValue("email", t.toLowerCase(), { shouldValidate: true })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Telefone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#6b7280"
              value={maskPhone(values.phone)}
              onChangeText={(t) => setValue("phone", t, { shouldValidate: true })}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
          </View>

          {/* Organização */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Faculdade/Empresa</Text>
            <TextInput
              style={[styles.input, errors.organization && styles.inputError]}
              placeholder="Ex.: Faculvale"
              placeholderTextColor="#6b7280"
              value={values.organization}
              onChangeText={(t) => setValue("organization", t, { shouldValidate: true })}
              autoCapitalize="words"
            />
            {errors.organization && <Text style={styles.errorText}>{errors.organization.message}</Text>}
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#6b7280"
              value={values.password}
              onChangeText={(t) => setValue("password", t, { shouldValidate: true })}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={[styles.input, errors.confirm && styles.inputError]}
              placeholder="Repita a senha"
              placeholderTextColor="#6b7280"
              value={values.confirm}
              onChangeText={(t) => setValue("confirm", t, { shouldValidate: true })}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirm && <Text style={styles.errorText}>{errors.confirm.message}</Text>}
          </View>

          {/* Botão */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              { opacity: !canSubmit || pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Criar usuário"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="person-add" size={18} color="#fff" />
                <Text style={styles.submitText}>Criar usuário</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
