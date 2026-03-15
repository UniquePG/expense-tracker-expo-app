import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Text, useTheme, Snackbar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {changePasswordSchema} from '../../utils/validationSchemas';
import {useUserStore} from '../../store/userStore';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

export const ChangePasswordScreen = ({navigation}) => {
  const theme = useTheme();
  const {changePassword} = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await changePassword(data.currentPassword, data.newPassword);
      
      setSuccess(true);
      reset();
      
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Change Password"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
            Enter your current password and choose a new secure password.
          </Text>

          <Controller
            control={control}
            name="currentPassword"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Current Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secureCurrent}
                leftIcon="lock"
                rightIcon={secureCurrent ? 'eye-off' : 'eye'}
                onRightPress={() => setSecureCurrent(!secureCurrent)}
                error={errors.currentPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({field: {onChange, value}}) => (
              <InputField
                label="New Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secureNew}
                leftIcon="lock-plus"
                rightIcon={secureNew ? 'eye-off' : 'eye'}
                onRightPress={() => setSecureNew(!secureNew)}
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmNewPassword"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Confirm New Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secureConfirm}
                leftIcon="lock-check"
                rightIcon={secureConfirm ? 'eye-off' : 'eye'}
                onRightPress={() => setSecureConfirm(!secureConfirm)}
                error={errors.confirmNewPassword?.message}
              />
            )}
          />

          <View style={styles.requirements}>
            <Text style={[styles.requirementsTitle, {color: theme.colors.text}]}>
              Password Requirements:
            </Text>
            <Text style={[styles.requirement, {color: theme.colors.textSecondary}]}>
              • At least 8 characters
            </Text>
            <Text style={[styles.requirement, {color: theme.colors.textSecondary}]}>
              • At least one uppercase letter
            </Text>
            <Text style={[styles.requirement, {color: theme.colors.textSecondary}]}>
              • At least one lowercase letter
            </Text>
            <Text style={[styles.requirement, {color: theme.colors.textSecondary}]}>
              • At least one number
            </Text>
          </View>

          <Button
            title="Change Password"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Updating..." />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{label: 'Dismiss', onPress: () => setError(null)}}>
        {error}
      </Snackbar>

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={2000}
        style={{backgroundColor: theme.colors.success}}>
        Password changed successfully!
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  requirements: {
    marginTop: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 8,
  },
});