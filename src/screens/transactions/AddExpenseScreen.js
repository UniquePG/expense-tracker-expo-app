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
import {expenseSchema} from '../../utils/validationSchemas';
import {useTransactions} from '../../hooks/useTransactions';
import {useTransactionStore} from '../../store/transactionStore';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {CurrencyInput} from '../../components/inputs/CurrencyInput';
import {SelectField} from '../../components/inputs/SelectField';
import {DatePickerField} from '../../components/inputs/DatePickerField';
import {ImagePickerField} from '../../components/inputs/ImagePickerField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {EXPENSE_CATEGORIES} from '../../constants/constants';

export const AddExpenseScreen = ({navigation, route}) => {
  const theme = useTheme();
  const {createTransaction} = useTransactions();
  const {categories} = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      date: new Date(),
      notes: '',
      receipt: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      const transactionData = {
        ...data,
        type: 'expense',
        amount: parseFloat(data.amount),
      };

      await createTransaction(transactionData);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.length > 0 
    ? categories.map(c => ({label: c.name, value: c.id}))
    : EXPENSE_CATEGORIES.map(c => ({label: c.name, value: c.id}));

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Add Expense"
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

          <Controller
            control={control}
            name="description"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Description"
                placeholder="What did you spend on?"
                value={value}
                onChangeText={onChange}
                leftIcon="pencil"
                error={errors.description?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({field: {onChange, value}}) => (
              <SelectField
                label="Category"
                value={value}
                options={categoryOptions}
                onSelect={onChange}
                placeholder="Select a category"
                error={errors.category?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({field: {onChange, value}}) => (
              <DatePickerField
                label="Date"
                value={value}
                onChange={onChange}
                error={errors.date?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Notes (Optional)"
                placeholder="Add any additional details..."
                value={value}
                onChangeText={onChange}
                leftIcon="note-text"
                multiline
                numberOfLines={3}
                error={errors.notes?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="receipt"
            render={({field: {onChange, value}}) => (
              <ImagePickerField
                label="Receipt (Optional)"
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Button
            title="Save Expense"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Saving..." />

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
  saveButton: {
    marginTop: 24,
  },
});