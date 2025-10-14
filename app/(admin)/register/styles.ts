import { StyleSheet } from "react-native";

const COLORS = {
  bg: "#000000",
  card: "#1f1f1f",
  border: "#2e2e2e",
  text: "#f5f5f5",
  subtext: "#cbd5e1",
  muted: "#9ca3af",
  primary: "#4c1d95",
  primaryDark: "#3b0764",
  danger: "#ef4444",
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
