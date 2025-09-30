export interface ScheduleProps {}

export interface BookingData {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  buffer_until?: string;
  status: 'active' | 'completed' | 'canceled';
  created_at: string;
}

export interface ScheduleCalendarProps {
  selectedDate: string;
  onDayPress: (day: { dateString: string }) => void;
  minDate: string;
}

export interface AvailableSlotsProps {
  date: string;
  slots: string[];
  isCreating: boolean;
  showDeviceModal: boolean;
  onSlotPress: (time: string) => void;
}

export interface DayBookingsProps {
  bookings: BookingData[];
}

export interface DeviceSelectionModalProps {
  visible: boolean;
  selectedTime: string;
  selectedDate: string;
  selectedDevices: string[];
  onToggleDevice: (device: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  devices: string[];
}

export interface EmptyStateProps {
  title: string;
  subtitle: string;
  iconName?: string;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
}

export interface LoadingScreenProps {
  message?: string;
}