export interface BookingItem {
  id: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm' ou 'HH:mm:ss'
  buffer_until: string;
  status: "active" | "canceled" | "completed";
}

export interface BookingCardProps {
  item: BookingItem;
}

export interface EmptyBookingsProps {}

export interface LoadingScreenProps {
  message?: string;
}

export interface BookingsListProps {
  bookings: BookingItem[];
  refreshing: boolean;
  onRefresh: () => void;
}