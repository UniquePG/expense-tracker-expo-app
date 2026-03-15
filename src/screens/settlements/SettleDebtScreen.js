import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {Text, useTheme, Snackbar, RadioButton} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {settlementSchema} from '../../utils/validationSchemas';
import {useFriends} from '../../hooks/useFriends';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {CurrencyInput} from '../../components/inputs/CurrencyInput';
import {DatePickerField} from '../../components/inputs/DatePickerField';
import {SelectField} from '../../components/inputs/SelectField';
import {Button} from '../../components/buttons/Button';
import {Avatar} from '../../components/ui/Avatar';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {formatCurrency} from '../../utils/formatCurrency';
import { useSettlementsStore } from '@/store';

export const SettleDebtScreen = ({navigation, route}) => {
  const {friendId} = route.params || {};
  const theme = useTheme();
  const {createSettlement} = useSettlementsStore();
  const {friends, balances, fetchFriends} = useFriends({autoFetch: true});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      amount: 0,
      toUserId: friendId || '',
      note: '',
      date: new Date(),
    },
  });

  const selectedFriendId = watch('toUserId');
  const amount = watch('amount');

  useEffect(() => {
    if (selectedFriendId) {
      const balance = balances.find(b => b.friendId === selectedFriendId);
      if (balance && balance.amount < 0) {
        // You owe this friend, suggest full amount
        setValue('amount', Math.abs(balance.amount));
      }
    }
  }, [selectedFriendId, balances, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      const settlementData = {
        ...data,
        amount: parseFloat(data.amount),
        paymentMethod,
      };

      await createSettlement(settlementData);
      
      Alert.alert(
        'Settlement Recorded',
        'Your payment has been recorded and is pending confirmation.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } catch (err) {
      setError(err.message || 'Failed to record settlement');
    } finally {
      setIsLoading(false);
    }
  };

  const friendOptions = friends
    .filter(f => {
      const balance = balances.find(b => b.friendId === f.id);
      return balance && balance.amount < 0; // Only show friends you owe
    })
    .map(f => ({
      label: `${f.firstName} ${f.lastName} (${formatCurrency(Math.abs(balances.find(b => b.friendId === f.id)?.amount || 0))})`,
      value: f.id,
    }));

  const selectedFriend = friends.find(f => f.id === selectedFriendId);
  const balance = balances.find(b => b.friendId === selectedFriendId);

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Record Payment"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          {friendOptions.length === 0 ? (
            <Card style={styles.noDebtsCard}>
              <Text style={[styles.noDebtsText, {color: theme.colors.text}]}>
                You don't owe anyone money right now!
              </Text>
              <Text style={[styles.noDebtsSubtext, {color: theme.colors.textSecondary}]}>
                All your debts are settled.
              </Text>
            </Card>
          ) : (
            <>
              <Controller
                control={control}
                name="toUserId"
                render={({field: {onChange, value}}) => (
                  <SelectField
                    label="Paying To"
                    value={value}
                    options={friendOptions}
                    onSelect={onChange}
                    placeholder="Select a friend you owe"
                    error={errors.toUserId?.message}
                  />
                )}
              />

              {selectedFriend && (
                <Card style={styles.friendCard}>
                  <View style={styles.friendRow}>
                    <Avatar
                      source={selectedFriend.avatar ? {uri: selectedFriend.avatar} : null}
                      firstName={selectedFriend.firstName}
                      lastName={selectedFriend.lastName}
                      size={48}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, {color: theme.colors.text}]}>
                        {selectedFriend.firstName} {selectedFriend.lastName}
                      </Text>
                      <Text style={[styles.friendBalance, {color: theme.colors.expense}]}>
                        You owe: {formatCurrency(Math.abs(balance?.amount || 0))}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              <Controller
                control={control}
                name="amount"
                render={({field: {onChange, value}}) => (
                  <CurrencyInput
                    label="Amount"
                    value={value}
                    onChange={onChange}
                    error={errors.amount?.message}
                  />
                )}
              />

              {balance && amount > Math.abs(balance.amount) && (
                <Text style={[styles.warning, {color: theme.colors.warning}]}>
                  This exceeds your debt of {formatCurrency(Math.abs(balance.amount))}
                </Text>
              )}

              <Controller
                control={control}
                name="date"
                render={({field: {onChange, value}}) => (
                  <DatePickerField
                    label="Payment Date"
                    value={value}
                    onChange={onChange}
                    error={errors.date?.message}
                  />
                )}
              />

              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Payment Method
              </Text>

              <View style={styles.paymentMethods}>
                {['cash', 'bank_transfer', 'paypal', 'venmo', 'other'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodButton,
                      paymentMethod === method && {backgroundColor: theme.colors.primary, borderColor: theme.colors.primary},
                    ]}
                    onPress={() => setPaymentMethod(method)}>
                    <Text
                      style={[
                        styles.methodText,
                        {color: paymentMethod === method ? '#FFFFFF' : theme.colors.text},
                      ]}>
                      {method.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Controller
                control={control}
                name="note"
                render={({field: {onChange, value}}) => (
                  <InputField
                    label="Note (Optional)"
                    placeholder="e.g., Paid in cash, Transaction ID, etc."
                    value={value}
                    onChangeText={onChange}
                    leftIcon="note-text"
                    multiline
                    numberOfLines={2}
                    error={errors.note?.message}
                  />
                )}
              />

              <Button
                title="Record Payment"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Recording..." />

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
  noDebtsCard: {
    padding: 24,
    alignItems: 'center',
  },
  noDebtsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noDebtsSubtext: {
    fontSize: 14,
  },
  friendCard: {
    marginBottom: 16,
    padding: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendBalance: {
    fontSize: 14,
    marginTop: 4,
  },
  warning: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  methodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 24,
  },
});