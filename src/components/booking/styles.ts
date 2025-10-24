import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#0b0f13",
    padding: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0f13",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#11161b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardDate: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  durationText: {
    color: "#9aa0a6",
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 14,
  },
  cancelButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#11161b",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9aa0a6",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyLink: {
    color: "#ffffff",
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  confirmButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#667eea", // azul-roxo principal
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 8,
},
confirmButtonText: {
  color: "#fff",
  fontWeight: "600",
  marginLeft: 4,
},

});