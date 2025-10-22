// app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '~/store/auth';

export default function Index() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return profile ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
