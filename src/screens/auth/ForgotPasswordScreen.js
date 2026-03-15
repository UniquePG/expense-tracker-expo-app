import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Text, useTheme, Snackbar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {forgotPasswordSchema} from '../../utils/validationSchemas';
import {authApi} from '../../api/authApi';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

export const ForgotPasswordScreen = ({navigation}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async data => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header title="Forgot Password" onBack={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.content}>
            <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <InputField
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email"
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            {success && (
              <View style={styles.successContainer}>
                <Text style={[styles.successText, {color: theme.colors.success}]}>
                  Check your email for password reset instructions.
                </Text>
                <Button
                  title="Back to Login"
                  variant="ghost"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backButton}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Sending..." />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(null),
        }}>
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
    flexGrow: 1,
    padding: 24,
  },
  content: {
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
  successContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
});