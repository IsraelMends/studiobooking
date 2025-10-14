import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '~/lib/supabase';
import { RegisterForm } from '~/utils/register/validation';

export const useRegisterSubmit = () => {
  const [submitting, setSubmitting] = useState(false);

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

  const submitRegistration = async (vals: RegisterForm) => {
  setSubmitting(true);
  try {
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: {
        email: vals.email,
        password: vals.password,
        full_name: vals.full_name,
        organization_id: vals.organization_id,
      },
    });

    if (error) {
      // Lê o corpo text/plain retornado pela Function (status 400)
      let serverMsg = "Erro desconhecido";
      const ctx: any = error.context;
      if (ctx?.text) {
        serverMsg = await ctx.text();               // web / RN recente
      } else if (ctx?._bodyBlob?.text) {
        serverMsg = await ctx._bodyBlob.text();     // fallback em RN
      }
      console.log("[invoke] status:", ctx?.status, "body:", serverMsg);
      throw new Error(serverMsg);
    }

    console.log("created user:", data);
    Alert.alert("Sucesso", "Conta criada com sucesso.");
  } catch (err: any) {
    Alert.alert("Erro ao registrar", err?.message ?? "Falha na função.");
  } finally {
    setSubmitting(false);
  }
};


  return { submitRegistration, submitting };
};