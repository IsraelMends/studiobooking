import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minHeight: 52,
  },
  pickerError: {
    borderColor: '#ef4444',
  },
  pickerIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  picker: {
    flex: 1,
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
    flex: 1,
  },
});

export default styles;