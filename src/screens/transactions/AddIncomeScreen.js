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
import {incomeSchema} from '../../utils/validationSchemas';
import {useTransactions} from '../../hooks/useTransactions';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {CurrencyInput} from '../../components/inputs/CurrencyInput';
import {SelectField} from '../../components/inputs/SelectField';
import {DatePickerField} from '../../components/inputs/DatePickerField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {INCOME_CATEGORIES} from '../../constants/constants';

export const AddIncomeScreen = ({navigation}) => {
  const theme = useTheme();
  const {createTransaction} = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      date: new Date(),
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      const transactionData = {
        ...data,
        type: 'income',
        amount: parseFloat(data.amount),
      };

      console.log('transactionData :', transactionData);
      await createTransaction(transactionData);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create income');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = INCOME_CATEGORIES.map(c => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Add Income"
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
                placeholder="What is this income for?"
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

          <Button
            title="Save Income"
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