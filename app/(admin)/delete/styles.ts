// app/(admin)/delete/styles.ts
import { StyleSheet } from "react-native";

export const tokens = {
  bg: "#0D0D0D",
  panel: "#111827",
  border: "#1F2937",
  borderStrong: "#2563EB",
  text: "#FFFFFF",
  muted: "#9CA3AF",
  btn: "#2563EB",
  danger: "#DC2626",
  disabled: "#374151",
  error: "#FCA5A5",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.bg,
  },

  // Header / search
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: tokens.bg,
  },
  headerTitle: {
    color: tokens.text,
    fontSize: 22,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: tokens.panel,
    color: tokens.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
  },
  searchBtn: {
    backgroundColor: tokens.btn,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchBtnText: {
    color: tokens.text,
    fontWeight: "700",
  },

  // Toolbar
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  selectAllBtn: {
    backgroundColor: tokens.panel,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
  },
  selectAllText: {
    color: tokens.text,
    fontWeight: "600",
  },
  deleteBtn: {
    backgroundColor: tokens.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deleteBtnDisabled: {
    backgroundColor: tokens.disabled,
  },
  deleteBtnText: {
    color: tokens.text,
    fontWeight: "800",
  },

  // Pressed state
  pressed: {
    opacity: 0.85,
  },

  // Loading / error / empty
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerBoxText: {
    color: tokens.text,
    marginTop: 12,
  },
  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    color: tokens.error,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: tokens.panel,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
  },
  retryBtnText: {
    color: tokens.text,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 24,
  },
  emptyText: {
    color: tokens.muted,
  },

  // List
  listContent: {
    padding: 16,
    gap: 8,
  },
  item: {
    backgroundColor: tokens.panel,
    borderColor: tokens.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
  },
  itemSelected: {
    borderColor: tokens.borderStrong,
  },
  itemPressed: {
    opacity: 0.9,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: tokens.text,
    fontWeight: "700",
  },
  itemSubtitle: {
    color: tokens.muted,
    marginTop: 2,
  },

  // Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    borderColor: tokens.borderStrong,
    backgroundColor: tokens.borderStrong,
  },
  checkboxOff: {
    borderColor: "#4B5563",
    backgroundColor: "transparent",
  },
  checkboxTick: {
    color: tokens.text,
    fontWeight: "900",
  },
  checkboxPlaceholder: {
    color: "#4B5563",
  },
});
