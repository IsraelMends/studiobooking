import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "~/lib/supabase"; // ajuste o import conforme seu projeto
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "~/lib/supabase";

import { styles } from "./styles";
import { th } from "date-fns/locale";

/** ================== NOOP STORAGE (para evitar warnings do Picker) ================== */
const noopStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

/*================================ SUPABASE TEMP ================== */
const supabaseTemp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, storage: noopStorage as any },
});

/** ================== SCHEMA ================== */
const RegisterSchema = z.object({
  full_name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  organization_id: z.string().uuid("Selecione uma organização válida"),
});

type RegisterForm = z.infer<typeof RegisterSchema>;

/** ================== UI ================== */
export default function RegisterScreen() {
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      organization_id: "",
    },
  });

  const selectedOrg = watch("organization_id");

  /** Carrega organizações para o Picker */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name")
          .order("name", { ascending: true });
        if (error) throw error;
        if (isMounted) setOrgs(data ?? []);
      } catch (err: any) {
        console.error("Erro ao carregar organizações:", err?.message);
        Alert.alert("Erro", "Não foi possível carregar as organizações.");
      } finally {
        if (isMounted) setLoadingOrgs(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  /** ================== SUBMIT ================== */
  const withTimeout = async <T,>(
    p: Promise<T>,
    ms: number,
    label: string
  ): Promise<T> => {
    return Promise.race([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(`${label} timeout após ${ms}ms`)), ms)
      ),
    ]) as Promise<T>;
  };

  const onSubmit = async (vals: RegisterForm) => {
    setSubmitting(true);
    try {
      // usa o cliente temporário (stateless) para cadastrar
      const { data: signUpRes, error: signUpErr } =
        await supabaseTemp.auth.signUp({
          email: vals.email,
          password: vals.password,
          options: {
            data: {
              full_name: vals.full_name,
              organization_id: vals.organization_id,
            },
            // emailRedirectTo: 'seuapp://auth/callback', // opcional
          },
        });

      if (signUpErr) {
        throw signUpErr;
      }

      // Se confirmação por e-mail estiver ativada: user=null e session=null (normal)
      const createdUser = signUpRes?.user ?? null;
      if (!createdUser) {
        Alert.alert(
          "Sucesso",
          "Conta criada! O usuário deve confirmar o e-mail para ativar o acesso."
        );
      } else {
        Alert.alert("Sucesso", "Conta criada com sucesso.");
      }
    } catch (err: any) {
      console.log(
        "[register] erro:",
        JSON.stringify(err, Object.getOwnPropertyNames(err))
      );
      const msg =
        err?.message ||
        err?.error_description ||
        "Não foi possível criar a conta. Tente novamente.";
      Alert.alert("Erro ao registrar", msg);
    } finally {
      setSubmitting(false);
    }
  };

  /** ================== RENDER ================== */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, value } }) => (
          <View>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Seu nome"
              autoCapitalize="words"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563eb"
            />
            {!!errors.full_name && (
              <Text style={styles.error}>{errors.full_name.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="voce@empresa.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563eb"
            />
            {!!errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563eb"
            />
            {!!errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <View>
        <Text style={styles.label}>Organização</Text>
        {loadingOrgs ? (
          <View style={{ paddingVertical: 12 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Picker
            selectedValue={selectedOrg}
            onValueChange={(val) => setValue("organization_id", String(val))}
            style={styles.picker}
            dropdownIconColor="#f9fafb"
          >
            <Picker.Item label="Selecione..." value="" color="#9CA3AF" />
            {orgs.map((o) => (
              <Picker.Item
                key={o.id}
                label={o.name}
                value={o.id}
                color="#F9FAFB"
              />
            ))}
          </Picker>
        )}
        {!!errors.organization_id && (
          <Text style={styles.error}>{errors.organization_id.message}</Text>
        )}
      </View>

      <TouchableOpacity
        disabled={submitting}
        onPress={handleSubmit(onSubmit)}
        style={[styles.button, submitting && { opacity: 0.6 }]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
