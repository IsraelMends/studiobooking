export interface HomeProps {}

export interface NextBookingCardProps {
  myNext: any;
  onViewAgenda: () => void;
  onScheduleNew: () => void;
}

export interface AdminSectionProps {
  onNavigateToUsers: () => void;
  onNavigateToReports: () => void;
  onNavigateToDay: () => void;
  onNavigateToRegister: () => void;
  onNavigateToDelete: () => void;
}

export interface HomeHeaderProps {
  userName: string;
}

export interface LoadingScreenProps {}