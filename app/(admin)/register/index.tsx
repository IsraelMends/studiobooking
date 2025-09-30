import React from "react";
import { RegisterForm } from "~/components/register";
import { useRegisterSubmit } from "~/hooks/register/useRegisterSubmit";

export default function RegisterScreen() {
  const { submitRegistration, submitting } = useRegisterSubmit();

  return (
    <RegisterForm 
      onSubmit={submitRegistration}
      loading={submitting}
    />
  );
}