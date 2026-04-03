import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { accountsApi, transactionsApi } from '../../api';
import DatePickerField from '../../components/inputs/DatePickerField';
import Header from '../../components/ui/Header';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';

const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Rental',
  'Gift',
  'Interest',
  'Bonus',
  'Refund',
  'Investment',
  'Other',
];

const AddIncomeScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    amount: '',
    incomeSource: 'Salary',
    accountId: '',
    transactionDate: new Date(),
    description: '',
  });

  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await accountsApi.getAll();
        const accountList = getAccountsFromResponse(response);
        setAccounts(accountList);
        if (accountList.length > 0 && !form.accountId) {
          setForm((prev) => ({ ...prev, accountId: accountList[0].id }));
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to load accounts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const getAccountsFromResponse = (response) => {
    if (Array.isArray(response?.data?.accounts)) return response.data.accounts;
    if (Array.isArray(response?.accounts)) return response.accounts;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const validateForm = () => {
    const newErrors = {};
    const amount = parseFloat(form.amount);

    if (!form.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!form.incomeSource.trim()) {
      newErrors.incomeSource = 'Income source is required';
    }

    if (!form.accountId) {
      newErrors.accountId = 'Please select or add an account';
    }

    if (form.transactionDate > new Date()) {
      newErrors.transactionDate = 'Transaction date cannot be in the future';
    }

    if (form.description.trim().length > 255) {
      newErrors.description = 'Description max 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = () => {
    navigation.navigate('AddAccount');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(form.amount);
    const payload = {
      accountId: form.accountId,
      amount,
      incomeSource: form.incomeSource.trim(),
      description: form.description.trim() || undefined,
      transactionDate: form.transactionDate.toISOString(),
    };

    setIsSaving(true);
    try {
      await transactionsApi.createIncome(payload);
      const selectedAccount = accounts.find((a) => a.id === form.accountId);
      const currency = selectedAccount?.currency || 'INR';
      const accountName = selectedAccount?.name || 'account';

      Alert.alert('Success', `${formatCurrency(amount, currency)} added to ${accountName}`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to add income';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.accountId);
  const amount = parseFloat(form.amount) || 0;

  return (
    <ScreenWrapper backgroundColor={colors.white}>
      <Header title="Add Income" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Amount Section */}
        <View style={styles.section}>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(amount, selectedAccount?.currency || 'INR')}
            </Text>
          </View>

          <Text style={styles.label}>Amount *</Text>
          <View
            style={[
              styles.inputContainer,
              form.amount && styles.inputContainerFocused,
              errors.amount && styles.inputContainerError,
            ]}
          >
            <Icon name="cash-multiple" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={form.amount}
              onChangeText={(text) => {
                setForm({ ...form, amount: text });
                if (text && !isNaN(parseFloat(text))) {
                  setErrors((prev) => ({ ...prev, amount: null }));
                }
              }}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Income Source */}
        <View style={styles.section}>
          <Text style={styles.label}>Income Source *</Text>
          <View style={[styles.pickerContainer, errors.incomeSource && styles.pickerContainerError]}>
            <Icon name="briefcase" size={20} color={colors.textSecondary} style={styles.pickerIcon} />
            <Picker
              selectedValue={form.incomeSource}
              onValueChange={(value) => {
                setForm({ ...form, incomeSource: value });
                if (value) setErrors((prev) => ({ ...prev, incomeSource: null }));
              }}
              style={styles.picker}
            >
              {INCOME_SOURCES.map((source) => (
                <Picker.Item key={source} label={source} value={source} />
              ))}
            </Picker>
          </View>
          {errors.incomeSource && <Text style={styles.errorText}>{errors.incomeSource}</Text>}
        </View>

        {/* Account Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Add to Account *</Text>
          <View style={[styles.pickerContainer, errors.accountId && styles.pickerContainerError]}>
            <Icon name="wallet" size={20} color={colors.textSecondary} style={styles.pickerIcon} />
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
            ) : accounts.length > 0 ? (
              <Picker
                selectedValue={form.accountId}
                onValueChange={(value) => {
                  setForm({ ...form, accountId: value });
                  if (value) setErrors((prev) => ({ ...prev, accountId: null }));
                }}
                style={styles.picker}
              >
                {accounts.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={`${account.name} (${formatCurrency(
                      parseFloat(account.balance || 0),
                      account.currency || 'INR'
                    )})`}
                    value={account.id}
                  />
                ))}
              </Picker>
            ) : null}
          </View>
          {errors.accountId && <Text style={styles.errorText}>{errors.accountId}</Text>}

          {accounts.length === 0 && (
            <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount}>
              <Icon name="plus" size={18} color={colors.white} />
              <Text style={styles.addAccountButtonText}>Add New Account</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction Date */}
        <View style={styles.section}>
          <DatePickerField
            label="Transaction Date"
            value={form.transactionDate}
            onChange={(date) => {
              setForm({ ...form, transactionDate: date });
              if (date <= new Date()) {
                setErrors((prev) => ({ ...prev, transactionDate: null }));
              }
            }}
          />
          {errors.transactionDate && <Text style={styles.errorText}>{errors.transactionDate}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <View
            style={[
              styles.inputContainer,
              form.description && styles.inputContainerFocused,
              errors.description && styles.inputContainerError,
            ]}
          >
            <Icon name="note-text" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., March salary payment"
              value={form.description}
              onChangeText={(text) => {
                setForm({ ...form, description: text });
                if (text.length <= 255) {
                  setErrors((prev) => ({ ...prev, description: null }));
                }
              }}
              maxLength={255}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Text style={styles.helperText}>{form.description.length}/255</Text>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving || isLoading || accounts.length === 0}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name="plus" size={20} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>Add Income</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  amountCard: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F4FF',
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.surface,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#F8FBFC',
  },
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: '#FEF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: colors.error,
    backgroundColor: '#FEF5F5',
  },
  pickerIcon: {
    marginRight: 12,
  },
  picker: {
    flex: 1,
    color: colors.text,
    height: 52,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  addAccountButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default AddIncomeScreen;
