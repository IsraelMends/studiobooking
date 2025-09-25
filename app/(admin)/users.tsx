// app/(admin)/users.tsx
import { useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBookings } from "~/store/booking";
import { useAuth } from "~/store/auth";

import { useRouter } from "expo-router";

export default function AdminUsers() {
  const { profile } = useAuth();
  const { adminUsers, loadAdminUsers } = useBookings();
  const router = useRouter();

  useEffect(() => {
    if (profile?.role === "admin") loadAdminUsers();
  }, [profile?.role]);
  if (profile?.role !== "admin") return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0f13", padding: 16 }}>
      <View style={{ flex: 1, backgroundColor: "#0b0f13", padding: 16 }}>
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "800",
            marginBottom: 12,
          }}
        >
          Usuários
        </Text>
        <FlatList
          data={adminUsers}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/user/[id]",
                  params: { id: item.id },
                })
              }
              style={{
                backgroundColor: "#11161b",
                padding: 14,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {item.name ?? item.email}
              </Text>
              <Text style={{ color: "#9aa0a6" }}>{item.email}</Text>
              {!!item.organization_id && (
                <Text style={{ color: "#9aa0a6" }}>
                  Org: {item.organization_id}
                </Text>
              )}
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}
