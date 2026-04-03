import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
;

const ProfileScreen = ({ navigation }) => {
  const logout = useAuthStore((state) => state.logout);
  const { profile, isLoading, fetchProfile } = useUserStore();
  // console.log('profile :', profile);

  useEffect(()=>{
    fetchProfile()
  },[])

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('NotificationSettings')}>
          <Icon name="bell-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileInfo}>
          <Avatar 
            source={profile?.avatar} 
            name={profile?.firstName || 'User'} 
            size={120} 
            radius={60}
          />
          <Text style={styles.name}>{profile?.firstName || 'Loading...'}</Text>
          <Text style={styles.email}>{profile?.email || ''}</Text>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GENERAL</Text>
          <MenuItem 
            icon="account-cog-outline" 
            title="Account Settings" 
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem 
            icon="account-multiple-outline" 
            title="Friends" 
            onPress={() => navigation.navigate('Friends')} 
          />
          <MenuItem 
            icon="lock-outline" 
            title="Security" 
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <MenuItem 
            icon="cash-multiple" 
            title="Currency Preferences" 
            subtitle={profile?.currency || 'USD'} 
            onPress={() => navigation.navigate('CurrencySettings')}
          />
          <MenuItem 
            icon="bell-outline" 
            title="Notifications" 
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <MenuItem icon="help-circle-outline" title="Help & Support" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  editBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 24,
    marginTop: 40,
    height: 56,
    borderRadius: 16,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProfileScreen;
