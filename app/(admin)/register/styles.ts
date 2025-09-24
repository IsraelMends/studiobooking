import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9aa0a6",
    marginTop: 6,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: "#e5e7eb",
    marginBottom: 6,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#263040",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    marginTop: 6,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  blockedCard: {
    margin: 20,
    backgroundColor: "#11161b",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  blockedTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  blockedText: {
    color: "#9aa0a6",
    textAlign: "center",
  },
});
