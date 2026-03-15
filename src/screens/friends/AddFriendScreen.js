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
import {friendRequestSchema} from '../../utils/validationSchemas';
import {useFriends} from '../../hooks/useFriends';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';

export const AddFriendScreen = ({navigation}) => {
  const theme = useTheme();
  const {sendFriendRequest} = useFriends();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(friendRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendFriendRequest(data.email);
      setSuccess(true);
      reset();
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Add Friend"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, {color: theme.colors.text}]}>
              Invite a Friend
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              Enter your friend's email address to send them a friend request. They'll need to accept your request before you can start splitting expenses.
            </Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Email Address"
                placeholder="friend@example.com"
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
            title="Send Friend Request"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Sending request..." />

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
        Friend request sent successfully!
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
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});