import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { useUserStore } from '../../store/userStore';

export const ProfileScreen = ({navigation}) => {
  const theme = useTheme();
  const {logout} = useAuth();
  const {profile, fetchProfile} = useUserStore();
  const {theme: appTheme, toggleTheme} = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Navigate to confirmation screen with password required
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'lock',
      title: 'Change Password',
      subtitle: 'Update your security settings',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      icon: 'currency-usd',
      title: 'Currency Settings',
      subtitle: 'Set your default currency',
      onPress: () => navigation.navigate('CurrencySettings'),
    },
    {
      icon: theme.dark ? 'white-balance-sunny' : 'moon-waning-crescent',
      title: 'Theme',
      subtitle: `Currently ${appTheme} mode`,
      onPress: toggleTheme,
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      onPress: () => {/* Open help */},
    },
    {
      icon: 'file-document',
      title: 'Privacy Policy',
      onPress: () => {/* Open privacy policy */},
    },
    {
      icon: 'file-document',
      title: 'Terms of Service',
      onPress: () => {/* Open terms */},
    },
  ];

  if (!profile) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Profile"
        rightIcon="cog"
        onRightPress={() => navigation.navigate('Settings')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.avatarContainer}>
            <Avatar
              source={profile.avatar ? {uri: profile.avatar} : null}
              firstName={profile.firstName}
              lastName={profile.lastName}
              size={100}
            />
            <View style={[styles.editBadge, {backgroundColor: theme.colors.primary}]}>
              <Icon name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.name, {color: theme.colors.text}]}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={[styles.email, {color: theme.colors.textSecondary}]}>
            {profile.email}
          </Text>
          
          {profile.phone && (
            <Text style={[styles.phone, {color: theme.colors.textSecondary}]}>
              {profile.phone}
            </Text>
          )}
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {profile.totalExpenses || 0}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Expenses
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {profile.totalGroups || 0}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Groups
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {profile.totalFriends || 0}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Friends
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}>
                <View style={[styles.menuIcon, {backgroundColor: theme.colors.primaryLight}]}>
                  <Icon name={item.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, {color: theme.colors.text}]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.menuSubtitle, {color: theme.colors.textSecondary}]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textDisabled} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Divider style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, {borderColor: theme.colors.error}]}
          textColor={theme.colors.error}
          icon="logout">
          Logout
        </Button>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.deleteAccount}>
          <Text style={[styles.deleteText, {color: theme.colors.error}]}>
            Delete Account
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, {color: theme.colors.textDisabled}]}>
          Version 1.0.0
        </Text>
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    marginTop: 2,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuDivider: {
    marginLeft: 52,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
  },
  deleteAccount: {
    alignItems: 'center',
    marginTop: 24,
  },
  deleteText: {
    fontSize: 14,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});