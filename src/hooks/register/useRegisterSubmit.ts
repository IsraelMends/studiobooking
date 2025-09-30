import { useState } from 'react';
import { Alert } from 'react-native';
import { supabaseTemp } from '~/utils/register/supabaseTemp';
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
      const { data: signUpRes, error: signUpErr } =
        await supabaseTemp.auth.signUp({
          email: vals.email,
          password: vals.password,
          options: {
            data: {
              full_name: vals.full_name,
              organization_id: vals.organization_id,
            },
          },
        });

      if (signUpErr) {
        throw signUpErr;
      }

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

  return { submitRegistration, submitting };
};