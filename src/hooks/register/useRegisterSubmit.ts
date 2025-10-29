import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "~/store/auth";

export function useRegisterSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submitRegistration = async (formData: {
    name: string;
    email: string;
    phone?: string;
    organization_id?: string;
    password: string;
  }) => {
    try {
      setSubmitting(true);
      console.log("📩 Iniciando cadastro:", formData.email);

      // ✅ Chama o método do store (que faz signUp + confirm_email via Edge Function)
      await useAuth.getState().register({
  name: formData.name?.trim() || "Usuário",
  email: formData.email,
  phone: formData.phone,
  organization_id: formData.organization_id,
  password: formData.password,
});


      console.log("✅ Usuário criado e confirmado via Edge Function!");
      Alert.alert("Sucesso", "Usuário cadastrado e confirmado com sucesso!");

      // Redireciona após cadastro
      router.push("/(auth)/login");
    } catch (error: any) {
      console.error("❌ Erro no cadastro:", error);
      Alert.alert(
        "Erro ao cadastrar",
        error.message ?? "Falha ao criar o usuário"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { submitRegistration, submitting };
}
