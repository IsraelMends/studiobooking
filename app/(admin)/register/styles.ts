import { StyleSheet } from "react-native";

// Paleta escura personalizada
const COLORS = {
  bg: "#000000",        // preto
  card: "#1f1f1f",      // cinza quase preto
  border: "#2e2e2e",    // cinza médio
  text: "#f5f5f5",      // quase branco
  subtext: "#cbd5e1",   // cinza claro
  muted: "#9ca3af",     // cinza médio claro
  primary: "#4c1d95",   // roxo escuro
  primaryDark: "#3b0764", // roxo ainda mais escuro
  danger: "#ef4444",    // vermelho para erros
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 8,
    color: COLORS.text,
  },
  picker: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 6,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  error: {
    color: COLORS.danger,
    marginTop: 6,
  },
});
