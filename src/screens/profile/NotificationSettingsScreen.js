import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, useTheme, Switch, Divider as PaperDivider} from 'react-native-paper';
import {useNotifications} from '../../hooks/useNotifications';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

const NOTIFICATION_TYPES = [
  {key: 'expenseCreated', label: 'New Expenses', description: 'When someone adds an expense you\'re involved in'},
  {key: 'expenseUpdated', label: 'Expense Updates', description: 'When an expense is modified'},
  {key: 'payments', label: 'Payments & Settlements', description: 'When someone records a payment to you'},
  {key: 'friendRequests', label: 'Friend Requests', description: 'When someone sends you a friend request'},
  {key: 'groupInvites', label: 'Group Invites', description: 'When you\'re invited to a group'},
  {key: 'reminders', label: 'Reminders', description: 'Weekly summaries and payment reminders'},
];

export const NotificationSettingsScreen = ({navigation}) => {
  const theme = useTheme();
  const {settings, fetchSettings, updateSettings, isLoading} = useNotifications();
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const toggleSetting = async (key) => {
    const newSettings = {
      ...localSettings,
      [key]: !localSettings[key],
    };
    setLocalSettings(newSettings);
    
    try {
      await updateSettings(newSettings);
    } catch (error) {
      // Revert on error
      setLocalSettings(localSettings);
    }
  };

  const renderToggleItem = (item) => (
    <View key={item.key} style={styles.toggleItem}>
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, {color: theme.colors.text}]}>
          {item.label}
        </Text>
        <Text style={[styles.toggleDescription, {color: theme.colors.textSecondary}]}>
          {item.description}
        </Text>
      </View>
      <Switch
        value={localSettings[item.key] !== false}
        onValueChange={() => toggleSetting(item.key)}
        color={theme.colors.primary}
      />
    </View>
  );

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Push Notifications
          </Text>
          
          {NOTIFICATION_TYPES.map((item, index) => (
            <React.Fragment key={item.key}>
              {renderToggleItem(item)}
              {index < NOTIFICATION_TYPES.length - 1 && (
                <PaperDivider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </Card>

        <Card style={[styles.card, {marginTop: 16}]}>
          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, {color: theme.colors.text}]}>
                Email Notifications
              </Text>
              <Text style={[styles.toggleDescription, {color: theme.colors.textSecondary}]}>
                Receive email summaries of your activity
              </Text>
            </View>
            <Switch
              value={localSettings.emailEnabled !== false}
              onValueChange={() => toggleSetting('emailEnabled')}
              color={theme.colors.primary}
            />
          </View>
        </Card>
      </ScrollView>

      <LoadingOverlay visible={isLoading && !settings} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    marginVertical: 8,
  },
});