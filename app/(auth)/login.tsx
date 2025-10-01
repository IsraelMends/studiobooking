import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "~/store/auth";
import { useRouter } from "expo-router";
import React from "react";

import styles from "./styles";

export default function Login() {
  const router = useRouter();
  const { register, login, profile, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    organization_id: "",
  });
  const [error, setError] = useState<string | null>(null);

  // 👉 quando profile existir, sai desta tela
  useEffect(() => {
    if (!loading && profile) {
      router.replace("/(tabs)/home");
    }
  }, [profile, loading]);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      const email = String(form.email || "")
        .trim()
        .toLowerCase();
      if (isRegister) {
        await register({
          name: form.name?.trim(),
          email,
          phone: form.phone?.trim(),
          organization_id: form.organization_id?.trim(),
          password: form.password,
        });
      } else {
        await login(email, form.password);
      }
      // Não precisa chamar router aqui — o useEffect acima faz o redirect
    } catch (e: any) {
      const msg = e?.message || "Falha ao autenticar";
      setError(msg);
      alert(msg);
      console.log("Login/Register error ->", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0b0f13",
        padding: 20,
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: 120,
          height: 120,
          alignSelf: "center",
          marginBottom: 20,
          backgroundColor: "white",
          borderRadius: 9999,
          padding: 10,
        }}
        resizeMode="contain"
      />

      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        {isRegister ? "" : "Entrar"}
      </Text>

      {isRegister && (
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#9aa0a6"
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
      )}
      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#9aa0a6"
        style={styles.input}
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#9aa0a6"
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(t) => setForm({ ...form, password: t })}
      />
      {isRegister && (
        <>
          <TextInput
            placeholder="Telefone"
            placeholderTextColor="#9aa0a6"
            style={styles.input}
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />
          <TextInput
            placeholder="Faculdade/Empresa"
            placeholderTextColor="#9aa0a6"
            style={styles.input}
            value={form.organization_id}
            onChangeText={(t) => setForm({ ...form, organization: t })}
          />
        </>
      )}

      {error && <Text style={{ color: "salmon" }}>{error}</Text>}

      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={{
          backgroundColor: "#20232a",
          padding: 12,
          borderRadius: 12,
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "700" }}
          >
            {isRegister ? "Registrar" : "Entrar"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}