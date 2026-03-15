import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Text, useTheme, Snackbar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema} from '../../utils/validationSchemas';
import {useAuth} from '../../hooks/useAuth';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {InputField} from '../../components/inputs/InputField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

export const LoginScreen = ({navigation}) => {
  const theme = useTheme();
  const {login, isLoading, error, clearError} = useAuth();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async data => {
    const result = await login(data.email, data.password);
    if (!result.success) {
      setSnackbarVisible(true);
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              Sign in to continue to your account
            </Text>
          </View>

          <View style={styles.form}>
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
                  placeholder="Enter your password"
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

            <Button
              title="Forgot Password?"
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
              textStyle={{fontSize: 14}}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={{color: theme.colors.textSecondary}}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              variant="ghost"
              onPress={() => navigation.navigate('Register')}
              textStyle={{color: theme.colors.primary}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Signing in..." />

      <Snackbar
        visible={snackbarVisible || !!error}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setSnackbarVisible(false);
            clearError();
          },
        }}>
        {error || 'Login failed. Please try again.'}
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
});