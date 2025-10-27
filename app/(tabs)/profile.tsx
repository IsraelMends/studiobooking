import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";

import { useProfileData } from "~/hooks/profile/useProfileData";
import { useLogout } from "~/hooks/profile/useLogout";
import {
  ProfileHeader,
  ProfileInfo,
  ProfileStats,
  ProfileActions,
  LoadingScreen,
} from "~/components/profile";
import { styles } from "~/components/profile/profile.styles";
import { supabase } from "~/lib/supabase";

export default function Profile() {
  const { profile, orgLabel, isAdmin, loadingOrg } = useProfileData();
  const { handleLogout } = useLogout();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingPref, setLoadingPref] = useState(true);

  // 🔹 Carrega a preferência de notificações do Supabase
  useEffect(() => {
    async function loadPreference() {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", profile.id)
        .single();

      if (!error && data) {
        setNotificationsEnabled(data.notifications_enabled ?? false);
      }
      setLoadingPref(false);
    }
    loadPreference();
  }, [profile?.id]);

  // 🔹 Ativa ou desativa notificações
  async function handleToggle(value: boolean) {
    if (!profile?.id) {
      Alert.alert("Erro", "Perfil não encontrado.");
      setNotificationsEnabled(false);
      return;
    }

    setNotificationsEnabled(value);

    if (value) {
      // ✅ Ativar notificações
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Ative as notificações nas configurações do seu dispositivo."
        );
        setNotificationsEnabled(false);
        return;
      }

      // Obter token de push
      const tokenResponse = await Notifications.getExpoPushTokenAsync();
      const expoToken = tokenResponse.data;

      // Salvar no banco
      const { error } = await supabase
        .from("profiles")
        .update({
          notifications_enabled: true,
          expo_push_token: expoToken,
        })
        .eq("id", profile.id);

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível ativar as notificações.");
        setNotificationsEnabled(false);
      } else {
        Alert.alert(
          "Notificações ativadas",
          "Você receberá lembretes de reserva 🎵"
        );
      }
    } else {
      // ❌ Desativar notificações
      try {
        // Cancela todas as notificações locais agendadas
        await Notifications.cancelAllScheduledNotificationsAsync();

        const { error } = await supabase
          .from("profiles")
          .update({
            notifications_enabled: false,
            expo_push_token: null,
          })
          .eq("id", profile.id);

        if (error) {
          console.error(error);
          Alert.alert("Erro", "Não foi possível desativar as notificações.");
          setNotificationsEnabled(true);
        } else {
          Alert.alert(
            "Notificações desativadas",
            "Você não receberá mais lembretes."
          );
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Falha ao desativar notificações locais.");
      }
    }
  }

  if (!profile || loadingPref) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader profile={profile} />
        <ProfileInfo profile={profile} orgLabel={orgLabel} isAdmin={isAdmin} />
        <ProfileStats lastAccess="Hoje" status="Ativo" />

        {/* 🔔 Preferências de Notificações */}
        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 16,
            marginVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              Receber notificações
            </Text>
            <Text style={{ color: "#555", marginTop: 4 }}>
              Confirmações e lembretes de reserva
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggle}
            thumbColor={notificationsEnabled ? "#2196f3" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>

        <ProfileActions
          onEditProfile={() => {
            /* lógica para editar perfil */
          }}
          onLogout={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
