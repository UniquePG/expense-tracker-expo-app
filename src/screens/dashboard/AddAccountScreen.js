import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useAccounts } from '../../hooks/useAccounts';
import { useUserStore } from '../../store';

const ACCOUNT_TYPES = [
  { label: 'Bank Account', value: 'BANK', icon: 'bank' },
  { label: 'Credit Card', value: 'CREDIT_CARD', icon: 'credit-card' },
  { label: 'Cash', value: 'CASH', icon: 'wallet' },
  { label: 'Digital Wallet', value: 'WALLET', icon: 'mobile-wallet' },
  { label: 'UPI', value: 'UPI', icon: 'qrcode' },
];

const AddAccountScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    type: '',
    currency: 'USD',
    balance: '',
  });

  const [errors, setErrors] = useState({});

  const { profile } = useUserStore();
  const { createAccount, isLoading } = useAccounts();

  useEffect(() => {
    if (profile?.user?.currency) {
      setForm((prev) => ({ ...prev, currency: profile.user.currency }));
    } else if (profile?.currency) {
      setForm((prev) => ({ ...prev, currency: profile.currency }));
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Account name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Account name must be at least 2 characters';
    }

    if (!form.type) {
      newErrors.type = 'Please select an account type';
    }

    if (!form.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const balanceValue = form.balance ? parseFloat(form.balance) : 0;

      if (isNaN(balanceValue) || balanceValue < 0) {
        setErrors({ balance: 'Please enter a valid amount' });
        return;
      }

      const result = await createAccount({
        name: form.name.trim(),
        type: form.type,
        balance: balanceValue,
        currency: form.currency || 'USD',
      });

      if (result) {
        Alert.alert('Success', 'Account created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create account');
    }
  };

  const getTypeIcon = (type) => {
    const typeObj = ACCOUNT_TYPES.find((t) => t.value === type);
    return typeObj?.icon || 'wallet';
  };

  return (
    <View style={styles.container}>
      <Header title="Add Account" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Account Name *</Text>
          <View
            style={[
              styles.inputContainer,
              form.name && styles.inputContainerFocused,
              errors.name && styles.inputContainerError,
            ]}
          >
            <Icon name="text" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., My Bank Account"
              value={form.name}
              onChangeText={(text) => {
                setForm({ ...form, name: text });
                if (text) setErrors((prev) => ({ ...prev, name: null }));
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Account Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Account Type *</Text>
          <View style={[styles.pickerContainer, errors.type && styles.pickerContainerError]}>
            <Icon name={getTypeIcon(form.type)} size={20} color={colors.textSecondary} style={styles.pickerIcon} />
            <Picker
              selectedValue={form.type}
              onValueChange={(value) => {
                setForm({ ...form, type: value });
                if (value) setErrors((prev) => ({ ...prev, type: null }));
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select account type" value="" />
              {ACCOUNT_TYPES.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {/* Currency & Balance */}
        <View style={styles.section}>
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Currency *</Text>
              <View style={[styles.readOnlyContainer, errors.currency && styles.inputContainerError]}>
                <Icon name="currency-usd" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={styles.readOnlyText}>{form.currency}</Text>
              </View>
              {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Initial Balance</Text>
              <View
                style={[
                  styles.inputContainer,
                  form.balance && styles.inputContainerFocused,
                  errors.balance && styles.inputContainerError,
                ]}
              >
                <Icon name="wallet-plus" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={form.balance}
                  onChangeText={(text) => {
                    setForm({ ...form, balance: text });
                    if (text === '' || !isNaN(parseFloat(text))) {
                      setErrors((prev) => ({ ...prev, balance: null }));
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {errors.balance && <Text style={styles.errorText}>{errors.balance}</Text>}
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icon name="loading" size={20} color={colors.white} style={styles.loadingIcon} />
          ) : (
            <>
              <Icon name="plus" size={20} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.createButtonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
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
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#F5F7FA',
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    marginTop: 16,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  loadingIcon: {
    marginRight: 10,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default AddAccountScreen;
