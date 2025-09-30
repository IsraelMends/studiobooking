import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { useProfileData } from '~/hooks/profile/useProfileData';
import { useLogout } from '~/hooks/profile/useLogout';
import { 
  ProfileHeader, 
  ProfileInfo, 
  ProfileStats, 
  ProfileActions, 
  LoadingScreen
} from '~/components/profile';
import { styles } from '~/components/profile/profile.styles';

export default function Profile() {
  const { profile, orgLabel, isAdmin, loadingOrg } = useProfileData();
  const { handleLogout } = useLogout();

  if (!profile) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader profile={profile} />
        <ProfileInfo 
          profile={profile} 
          orgLabel={orgLabel} 
          isAdmin={isAdmin} 
        />
        <ProfileStats 
          lastAccess="Hoje" 
          status="Ativo" 
        />
        <ProfileActions 
          onEditProfile={() => {/* lógica para editar perfil */}}
          onLogout={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}