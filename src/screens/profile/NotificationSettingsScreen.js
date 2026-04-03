import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch } from 'react-native';
import { notificationsApi } from '../../api';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import { colors } from '../../constants/colors';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Toast from 'react-native-toast-message';

const NotificationSettingsScreen = () => {
  const [settings, setSettings] = useState({
    friendRequestNotifications: true,
    expenseNotifications: true,
    settlementNotifications: true,
    groupNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await notificationsApi.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await notificationsApi.updateSettings(newSettings);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update setting' });
      setSettings(settings); // Revert
    }
  };

  const SettingItem = ({ label, value, onToggle, description }) => (
    <View style={styles.item}>
      <View style={styles.itemText}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description && <Text style={styles.itemDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );

  return (
    <ScreenWrapper>
      <Header title="Notification Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>APP NOTIFICATIONS</Text>
        <SettingItem
          label="Friend Requests"
          description="When someone sends you a friend request"
          value={settings.friendRequestNotifications}
          onToggle={() => toggleSetting('friendRequestNotifications')}
        />
        <SettingItem
          label="New Expenses"
          description="When someone adds an expense with you"
          value={settings.expenseNotifications}
          onToggle={() => toggleSetting('expenseNotifications')}
        />
        <SettingItem
          label="Settlements"
          description="When someone records a payment"
          value={settings.settlementNotifications}
          onToggle={() => toggleSetting('settlementNotifications')}
        />
        <SettingItem
          label="Group Activity"
          description="Invites and updates in your groups"
          value={settings.groupNotifications}
          onToggle={() => toggleSetting('groupNotifications')}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CHANNELS</Text>
        <SettingItem
          label="Push Notifications"
          value={settings.pushNotifications}
          onToggle={() => toggleSetting('pushNotifications')}
        />
        <SettingItem
          label="Email Notifications"
          value={settings.emailNotifications}
          onToggle={() => toggleSetting('emailNotifications')}
        />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    flex: 1,
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default NotificationSettingsScreen;
