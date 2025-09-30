import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
  },
  scrollContent: {
    padding: 16,
    backgroundColor: "#0b0f13",
    flexGrow: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  slotButton: {
    flexDirection: "row",
    backgroundColor: "#11161b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  slotText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  slotBuffer: {
    color: "#9aa0a6",
    fontSize: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#11161b",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
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
  cardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#20232a",
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTime: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  bookingStatus: {
    color: "#9aa0a6",
    fontSize: 12,
    marginTop: 2,
  },
  
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#20232a",
    borderRadius: 12,
    marginTop: 12,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#9aa0a6",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Novos estilos para o modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0f13",
    padding: 20,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#9aa0a6",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  devicesList: {
    width: "100%",
    maxHeight: 300,
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#11161b",
    borderRadius: 8,
    marginBottom: 12,
  },
  deviceText: {
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 12,
  },
  confirmButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#555555",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#20232a",
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  email: {
    color: "#9aa0a6",
    fontSize: 16,
    textAlign: "center",
  },
  orgText: {
    color: "#9aa0a6",
    fontSize: 14,
    textAlign: "center",
  },
  badgeContainer: {
    marginTop: 8,
  },
  
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  nextBookingDate: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  durationText: {
    color: "#9aa0a6",
    fontSize: 14,
    marginBottom: 12,
  },
  noBookingText: {
    color: "#9aa0a6",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  adminSection: {
    gap: 12,
  },
  adminCards: {
    gap: 12,
  },
  adminCard: {
    flexDirection: "row",
    backgroundColor: "#1a2a33",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    flex: 1,
  },
  adminCardTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  adminCardSubtitle: {
    color: "#9aa0a6",
    fontSize: 14,
    marginTop: 2,
  },
  loading: {
    marginTop: 100,
  },
});

export default styles;
