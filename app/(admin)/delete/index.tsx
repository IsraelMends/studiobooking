// app/(admin)/delete/index.tsx
// Tela para selecionar e excluir usuários — SUPABASE (com styles separados)

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles, tokens } from "./styles";
import { supabase } from "~/lib/supabase";

type UserRow = {
  id: string;
  name: string | null;
  email?: string | null;
};

const TABLE_NAME = "profiles"; // <- ajuste para a sua tabela
const CALL_EDGE_FUNCTION_FOR_AUTH_DELETE = false;
const EDGE_FUNCTION_NAME = "delete-users";

async function fetchUsersFromSupabase(query: string): Promise<UserRow[]> {
  let q = supabase
  .from(TABLE_NAME)
  .select("id, name, email, created_at")
  .order("created_at", { ascending: false });


  if (query?.trim()) {
    const like = `%${query.trim()}%`;
    q = q.or(`name.ilike.${like},email.ilike.${like}`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as UserRow[];
}

async function deleteUsersOnSupabase(userIds: string[]): Promise<void> {
  if (!userIds.length) return;

  const { error: tableError } = await supabase.from(TABLE_NAME).delete().in("id", userIds);
  if (tableError) throw tableError;

  if (CALL_EDGE_FUNCTION_FOR_AUTH_DELETE) {
    const { error: fnError } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { ids: userIds },
    });
    if (fnError) throw fnError;
  }
}

export default function DeleteUsersScreen() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (q: string) => {
      setError(null);
      if (!refreshing) setLoading(true);
      try {
        const data = await fetchUsersFromSupabase(q);
        setUsers(data ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Erro ao carregar usuários");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshing]
  );

  useEffect(() => {
    loadUsers("");
  }, [loadUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(search);
  }, [loadUsers, search]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = useMemo(
    () => users.length > 0 && selected.size === users.length,
    [users.length, selected.size]
  );

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (users.length === 0) return prev;
      if (prev.size === users.length) return new Set();
      return new Set(users.map((u) => u.id));
    });
  }, [users]);

  const confirmDelete = useCallback(() => {
    if (selected.size === 0) {
      Alert.alert("Nenhum usuário selecionado", "Selecione pelo menos um usuário para excluir.");
      return;
    }
    const count = selected.size;
    Alert.alert(
      "Excluir usuários",
      `Tem certeza que deseja excluir ${count} ${count === 1 ? "usuário" : "usuários"}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteUsersOnSupabase(Array.from(selected));
              setUsers((prev) => prev.filter((u) => !selected.has(u.id)));
              setSelected(new Set());
            } catch (err: any) {
              console.error(err);
              Alert.alert("Erro ao excluir", err?.message ?? "Tente novamente.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [selected]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Excluir Usuários</Text>

        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou e-mail..."
            placeholderTextColor={tokens.muted}
            onSubmitEditing={() => loadUsers(search)}
            style={styles.input}
          />
          <Pressable onPress={() => loadUsers(search)} style={({ pressed }) => [styles.searchBtn, pressed && styles.pressed]}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </Pressable>
        </View>

        <View style={styles.toolbarRow}>
          <Pressable onPress={toggleSelectAll} style={({ pressed }) => [styles.selectAllBtn, pressed && styles.pressed]}>
            <Text style={styles.selectAllText}>
              {allSelected ? "Desmarcar todos" : "Selecionar todos"}
            </Text>
          </Pressable>

          <Pressable
            onPress={confirmDelete}
            disabled={deleting || selected.size === 0}
            style={({ pressed }) => [
              styles.deleteBtn,
              (deleting || selected.size === 0) ? styles.deleteBtnDisabled : null,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.deleteBtnText}>
              {deleting ? "Excluindo..." : `Excluir (${selected.size})`}
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={styles.centerBoxText}>Carregando usuários...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadUsers(search)} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                onPress={() => toggleSelect(item.id)}
                style={({ pressed }) => [
                  styles.item,
                  isSelected && styles.itemSelected,
                  pressed && styles.itemPressed,
                ]}
              >
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.name ?? "Sem nome"}</Text>
                    {!!item.email && (
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {item.email}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.checkbox, isSelected ? styles.checkboxOn : styles.checkboxOff]}>
                    {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : <Text style={styles.checkboxPlaceholder}> </Text>}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {search ? "Nenhum usuário encontrado para a busca." : "Nenhum usuário disponível."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
