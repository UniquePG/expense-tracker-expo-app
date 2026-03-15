import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {Text, useTheme, Snackbar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {expenseSchema} from '../../utils/validationSchemas';
import {useExpenses} from '../../hooks/useExpenses';
import {expensesApi} from '../../api/expensesApi';
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

export const EditExpenseScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const {updateExpense, currentExpense, fetchExpenseDetails} = useExpenses();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
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

  useEffect(() => {
    fetchExpenseDetails(id);
  }, [id]);

  useEffect(() => {
    if (currentExpense) {
      reset({
        description: currentExpense.description,
        amount: currentExpense.amount,
        category: currentExpense.category?.id,
        date: new Date(currentExpense.date),
        notes: currentExpense.notes || '',
        receipt: currentExpense.receipt ? {uri: currentExpense.receipt} : null,
      });
    }
  }, [currentExpense, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      await updateExpense(id, expenseData);

      if (data.receipt && data.receipt.uri !== currentExpense?.receipt) {
        await expensesApi.uploadReceipt(id, data.receipt);
      }

      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await expensesApi.deleteExpense(id);
              navigation.goBack();
            } catch (error) {
              setError('Failed to delete expense');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!currentExpense) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Edit Expense"
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
                placeholder="What was this expense for?"
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
                options={EXPENSE_CATEGORIES.map(c => ({label: c.name, value: c.id}))}
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
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />

          <Button
            title="Delete Expense"
            variant="outline"
            onPress={handleDelete}
            style={[styles.deleteButton, {borderColor: theme.colors.error}]}
            textStyle={{color: theme.colors.error}}
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
  deleteButton: {
    marginTop: 12,
    borderWidth: 1,
  },
});