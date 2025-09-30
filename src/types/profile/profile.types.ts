export interface ProfileProps {}

// Tipo que reflete exatamente o que vem do store
export interface ProfileData {
  name: string | null;
  email: string | null;
  organization_id?: string | null;
  role: 'admin' | 'user';
  last_access?: string | null;
}

export interface OrganizationData {
  name: string;
}

export interface ProfileHeaderProps {
  profile: ProfileData;
}

export interface ProfileInfoProps {
  profile: ProfileData;
  orgLabel: string;
  isAdmin: boolean;
}

export interface ProfileStatsProps {
  lastAccess: string;
  status: string;
}

export interface ProfileActionsProps {
  onEditProfile: () => void;
  onLogout: () => void;
}

export interface LoadingScreenProps {
  message?: string;
}