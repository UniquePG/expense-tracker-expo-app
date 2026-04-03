import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../../components/buttons/Button';
import CurrencyInput from '../../components/inputs/CurrencyInput';
import InputField from '../../components/inputs/InputField';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useAccounts } from '../../hooks/useAccounts';

const account_types = [
  { label: 'Bank Account', value: 'BANK' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Wallet', value: 'WALLET' },
  { label: 'UPI', value: 'UPI' },
];

const EditAccountScreen = ({ route, navigation }) => {
  const { account } = route.params || {};
  const [form, setForm] = useState({
    name: '',
    type: '',
    currency: '',
    balance: '',
  });

  const { updateAccount, isLoading } = useAccounts();

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || '',
        type: account.type || '',
        currency: account.currency || '',
        balance: account.balance?.toString() || '',
      });
    }
  }, [account]);

  if (!account) {
    return (
      <View style={styles.container}>
        <Header title="Edit Account" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <InputField value="Account not found" editable={false} />
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Account name is required');
      return;
    }

    try {
      const result = await updateAccount(account.id, {
        name: form.name,
        balance: form.balance ? parseFloat(form.balance) : account.balance,
      });

      if (result?.success) {
        Alert.alert('Success', 'Account updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update account');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Account" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content}>
        <InputField
          label="Account Name *"
          placeholder="e.g., My Bank Account"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

        <InputField
          label="Account Type"
          value={
            account_types.find((t) => t.value === form.type)?.label ||
            form.type
          }
          editable={false}
        />

        <View style={styles.row}>
          <View style={styles.currencyField}>
            <InputField
              label="Currency"
              value={form.currency}
              editable={false}
            />
          </View>
          <View style={styles.balanceField}>
            <CurrencyInput
              label="Balance"
              value={form.balance}
              onChangeText={(text) => setForm({ ...form, balance: text })}
              currency={form.currency}
              placeholder="0.00"
            />
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          style={styles.button}
        />
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
    padding: 24,
  },
  errorContainer: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyField: {
    flex: 1,
  },
  balanceField: {
    flex: 2,
  },
  button: {
    marginTop: 24,
    marginBottom: 60,
  },
});

export default EditAccountScreen;
