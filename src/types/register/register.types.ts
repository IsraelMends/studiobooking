export interface RegisterProps {}

export interface Organization {
  id: string;
  name: string;
}

export interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export interface OrganizationPickerProps {
  organizations: Organization[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

export interface SubmitButtonProps {
  onPress: () => void;
  loading: boolean;
  title: string;
}

export interface RegisterFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export interface LoadingScreenProps {
  message?: string;
}