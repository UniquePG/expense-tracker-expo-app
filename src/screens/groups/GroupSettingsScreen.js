import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {Text, useTheme, Snackbar, Switch} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {groupSchema} from '../../utils/validationSchemas';
import {useGroups} from '../../hooks/useGroups';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {SelectField} from '../../components/inputs/SelectField';
import {Button} from '../../components/buttons/Button';
import {Divider} from '../../components/ui/Divider';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {CURRENCIES} from '../../constants/constants';

export const GroupSettingsScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const {currentGroup, updateGroup, isLoading} = useGroups();
  const [error, setError] = useState(null);
  const [simplifyDebts, setSimplifyDebts] = useState(currentGroup?.simplifyDebts || false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: currentGroup?.name || '',
      description: currentGroup?.description || '',
      currency: currentGroup?.currency || 'USD',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError(null);
      await updateGroup(id, {
        ...data,
        simplifyDebts,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to update group');
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer be able to see or add expenses.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            // API call to leave group
            navigation.goBack();
          },
        },
      ]
    );
  };

  const currencyOptions = CURRENCIES.map(c => ({
    label: `${c.name} (${c.symbol})`,
    value: c.code,
  }));

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Group Settings"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <Controller
            control={control}
            name="name"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Group Name"
                value={value}
                onChangeText={onChange}
                leftIcon="account-group"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Description"
                value={value}
                onChangeText={onChange}
                leftIcon="text"
                multiline
                numberOfLines={2}
                error={errors.description?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="currency"
            render={({field: {onChange, value}}) => (
              <SelectField
                label="Currency"
                value={value}
                options={currencyOptions}
                onSelect={onChange}
                error={errors.currency?.message}
              />
            )}
          />

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, {color: theme.colors.text}]}>
                Simplify Debts
              </Text>
              <Text style={[styles.switchDescription, {color: theme.colors.textSecondary}]}>
                Automatically minimize the number of payments between group members
              </Text>
            </View>
            <Switch
              value={simplifyDebts}
              onValueChange={setSimplifyDebts}
              color={theme.colors.primary}
            />
          </View>

          <Divider spacing={32} />

          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />

          <Button
            title="Leave Group"
            variant="outline"
            onPress={handleLeaveGroup}
            style={[styles.leaveButton, {borderColor: theme.colors.error}]}
            textStyle={{color: theme.colors.error}}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{label: 'Dismiss', onPress: () => setError(null)}}>
        {error}
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
  leaveButton: {
    borderWidth: 1,
  },
});