import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Text, useTheme, Snackbar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {registerSchema} from '../../utils/validationSchemas';
import {useAuth} from '../../hooks/useAuth';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {InputField} from '../../components/inputs/InputField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

export const RegisterScreen = ({navigation}) => {
  const theme = useTheme();
  const {register, isLoading} = useAuth();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async data => {
    try {
      setError(null);
      console.log('data :', data);
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={[styles.title, {color: theme.colors.primary}]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="firstName"
              render={({field: {onChange, value}}) => (
                <InputField
                  label="First Name"
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  leftIcon="account"
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({field: {onChange, value}}) => (
                <InputField
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  leftIcon="account"
                  error={errors.lastName?.message}
                />
              )}
            />

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

            <Controller
              control={control}
              name="password"
              render={({field: {onChange, value}}) => (
                <InputField
                  label="Password"
                  placeholder="Create a password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={secureTextEntry}
                  leftIcon="lock"
                  rightIcon={secureTextEntry ? 'eye-off' : 'eye'}
                  onRightPress={() => setSecureTextEntry(!secureTextEntry)}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({field: {onChange, value}}) => (
                <InputField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={secureConfirmEntry}
                  leftIcon="lock-check"
                  rightIcon={secureConfirmEntry ? 'eye-off' : 'eye'}
                  onRightPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={{color: theme.colors.textSecondary}}>
              Already have an account?{' '}
            </Text>
            <Button
              title="Sign In"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
              textStyle={{color: theme.colors.primary}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Creating account..." />

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

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={2000}
        style={{backgroundColor: theme.colors.success}}>
        Account created successfully! Redirecting to login...
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
  header: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
});