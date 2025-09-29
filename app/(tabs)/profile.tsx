import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import styles from "../styles";

import { useAuth } from "~/store/auth";
import { useRouter } from "expo-router";
import { supabase } from "~/lib/supabase";

const { width } = Dimensions.get("window");

export default function Profile() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const [orgName, setOrgName] = useState<string | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  useEffect(() => {
    async function loadOrgName() {
      if (!profile?.organization_id) {
        setOrgName(null);
        return;
      }
      setLoadingOrg(true);
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", profile.organization_id)
          .single();

        if (error) {
          console.error("Erro ao buscar organização:", error);
          setOrgName(null);
        } else {
          setOrgName(data?.name || null);
        }
      } catch (e) {
        console.error("Erro inesperado ao buscar organização:", e);
        setOrgName(null);
      } finally {
        setLoadingOrg(false);
      }
    }
    loadOrgName();
  }, [profile?.organization_id]);

  const isAdmin = profile?.role === "admin";
  const orgLabel = loadingOrg
    ? "Carregando..."
    : orgName || profile?.organization_id?.trim() || "Não informado";

  const handleLogout = useCallback(async () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair? Você será redirecionado para a tela de login.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.resolve(logout());
              router.replace("/(auth)/login");
            } catch (e: any) {
              Alert.alert(
                "Erro ao Sair",
                String(e?.message ?? e) || "Tente novamente."
              );
            }
          },
        },
      ]
    );
  }, [logout, router]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="person" size={48} color="#9aa0a6" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com gradiente */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.statusIndicator} />
          </View>

          <Text style={styles.userName}>{profile.name ?? "Usuário"}</Text>
          <Text style={styles.userEmail}>{profile.email ?? "sem e-mail"}</Text>
        </LinearGradient>

        {/* Informações do perfil */}
        <View style={styles.profileInfo}>
          {/* Card da organização */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="business" size={24} color="#667eea" />
              <Text style={styles.infoTitle}>Organização</Text>
            </View>
            <Text style={styles.infoValue}>{orgLabel}</Text>
          </View>

          {/* Card do tipo de usuário */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons
                name={isAdmin ? "admin-panel-settings" : "person"}
                size={24}
                color={isAdmin ? "#10b981" : "#667eea"}
              />
              <Text style={styles.infoTitle}>Tipo de Conta</Text>
            </View>
            <View style={styles.roleContainer}>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: isAdmin ? "#ecfdf5" : "#eff6ff",
                    borderColor: isAdmin ? "#10b981" : "#667eea",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: isAdmin ? "#10b981" : "#667eea" },
                  ]}
                >
                  {isAdmin ? "Administrador" : "Usuário"}
                </Text>
              </View>
            </View>
          </View>

          {/* Estatísticas ou informações adicionais */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="access-time" size={20} color="#9aa0a6" />
              <Text style={styles.statLabel}>Último acesso</Text>
              <Text style={styles.statValue}>Hoje</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="security" size={20} color="#9aa0a6" />
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>Ativo</Text>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => {
              const editProfileRoute = "/(profile)/edit";
              const routeExists = false; // Mude para true quando criar a rota

              if (routeExists) {
                router.push(editProfileRoute);
              } else {
                Alert.alert(
                  "Em breve",
                  "Funcionalidade de edição será implementada em breve.",
                  [{ text: "OK", style: "default" }]
                );
              }
            }}
          >
            <MaterialIcons name="edit" size={20} color="#667eea" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.actionButton,
              styles.logoutButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            accessibilityHint="Encerra a sessão e redireciona para o login"
          >
            <MaterialIcons name="logout" size={20} color="#ffffff" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
