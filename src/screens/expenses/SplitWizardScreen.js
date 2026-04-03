import { useEffect, useMemo, useState } from 'react';
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
import { expensesApi } from '../../api';
import Avatar from '../../components/ui/Avatar';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';

const TYPES = ['EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES'];

const num = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const asExpense = (response) =>
  response?.data?.expense || response?.expense || response?.data || response || null;

const personName = (split) =>
  split?.user?.fullName ||
  [split?.user?.firstName, split?.user?.lastName].filter(Boolean).join(' ').trim() ||
  split?.user?.name ||
  split?.contact?.name ||
  'Unknown';

const SplitWizardScreen = ({ navigation, route }) => {
  const { expenseId } = route.params;

  const [expense, setExpense] = useState(null);
  const [splitType, setSplitType] = useState('EQUAL');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await expensesApi.getById(expenseId);
        const data = asExpense(response);
        setExpense(data);
        setSplitType(data?.splitType || 'EQUAL');
        setRows(
          (data?.splits || []).map((split) => ({
            id: split.id,
            userId: split.user?.id || null,
            contactId: split.contact?.id || null,
            name: personName(split),
            avatar: split.user?.avatar || split.contact?.avatar || null,
            isPayer: !!split.isPayer,
            percentage:
              split.percentage != null
                ? String(split.percentage)
                : data?.amount
                ? String(round2((num(split.amount) / num(data.amount)) * 100))
                : '',
            exactAmount: split.amount != null ? String(split.amount) : '',
            shares: split.shares != null ? String(split.shares) : '1',
          }))
        );
      } catch {
        Alert.alert('Error', 'Failed to load split wizard.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [expenseId]);

  const totalAmount = num(expense?.amount);
  const currency = expense?.currency || 'INR';

  const computed = useMemo(() => {
    if (!rows.length) return [];

    if (splitType === 'EQUAL') {
      const base = round2(totalAmount / rows.length);
      const data = rows.map((row) => ({ key: row.id, amount: base }));
      const remainder = round2(totalAmount - round2(base * rows.length));
      const payer = data.find((item) => rows.find((row) => row.id === item.key)?.isPayer) || data[0];
      payer.amount = round2(payer.amount + remainder);
      return data;
    }

    if (splitType === 'PERCENTAGE') {
      const data = rows.map((row) => ({
        key: row.id,
        amount: round2((totalAmount * num(row.percentage)) / 100),
      }));
      const remainder = round2(totalAmount - round2(data.reduce((t, item) => t + item.amount, 0)));
      const payer = data.find((item) => rows.find((row) => row.id === item.key)?.isPayer) || data[0];
      payer.amount = round2(payer.amount + remainder);
      return data;
    }

    if (splitType === 'EXACT') {
      return rows.map((row) => ({ key: row.id, amount: round2(num(row.exactAmount)) }));
    }

    const totalShares = rows.reduce((t, row) => t + Math.max(0, Number.parseInt(row.shares || '0', 10)), 0);
    if (totalShares <= 0) return rows.map((row) => ({ key: row.id, amount: 0 }));
    const data = rows.map((row) => ({
      key: row.id,
      amount: round2((totalAmount * Math.max(0, Number.parseInt(row.shares || '0', 10))) / totalShares),
    }));
    const remainder = round2(totalAmount - round2(data.reduce((t, item) => t + item.amount, 0)));
    const payer = data.find((item) => rows.find((row) => row.id === item.key)?.isPayer) || data[0];
    payer.amount = round2(payer.amount + remainder);
    return data;
  }, [rows, splitType, totalAmount]);

  const validation = useMemo(() => {
    if (!rows.length) return { valid: false, text: 'No participants.' };
    if (splitType === 'PERCENTAGE') {
      const sum = round2(rows.reduce((t, row) => t + num(row.percentage), 0));
      return { valid: Math.abs(sum - 100) <= 0.01, text: `${sum}% / 100%` };
    }
    if (splitType === 'EXACT') {
      const sum = round2(rows.reduce((t, row) => t + num(row.exactAmount), 0));
      return {
        valid: Math.abs(sum - totalAmount) <= 0.01,
        text: `${formatCurrency(sum, currency)} / ${formatCurrency(totalAmount, currency)}`,
      };
    }
    if (splitType === 'SHARES') {
      const totalShares = rows.reduce((t, row) => t + Math.max(0, Number.parseInt(row.shares || '0', 10)), 0);
      return { valid: totalShares > 0, text: `${totalShares} total shares` };
    }
    return { valid: true, text: 'Equal split auto-calculated' };
  }, [rows, splitType, totalAmount, currency]);

  const setRowField = (rowId, field, value) =>
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));

  const onApply = async () => {
    if (!validation.valid) {
      Alert.alert('Invalid Split', validation.text);
      return;
    }

    const payload = {
      splitType,
      participants: rows.map((row) => {
        const base = row.userId ? { userId: row.userId } : { contactId: row.contactId };
        if (splitType === 'PERCENTAGE') return { ...base, percentage: num(row.percentage) };
        if (splitType === 'EXACT') return { ...base, amount: round2(num(row.exactAmount)) };
        if (splitType === 'SHARES') return { ...base, shares: Math.max(1, Number.parseInt(row.shares || '1', 10)) };
        return base;
      }),
    };

    setIsSaving(true);
    try {
      await expensesApi.update(expenseId, payload);
      Alert.alert('Split Updated', 'Split has been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update split.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !expense) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Wizard</Text>
        <TouchableOpacity onPress={onApply} disabled={isSaving}>
          <Text style={[styles.headerAction, { opacity: isSaving ? 0.5 : 1 }]}>Apply</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.expenseName}>{expense.description}</Text>
        <Text style={styles.total}>{formatCurrency(totalAmount, currency)}</Text>
      </View>

      <View style={styles.tabs}>
        {TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, splitType === type && styles.tabActive]}
            onPress={() => setSplitType(type)}
          >
            <Text style={[styles.tabText, splitType === type && styles.tabTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <View style={styles.left}>
              <Avatar source={row.avatar} name={row.name} size={34} />
              <Text style={styles.name}>{row.name}</Text>
            </View>

            {splitType === 'EQUAL' && (
              <Text style={styles.amount}>{formatCurrency(computed.find((item) => item.key === row.id)?.amount || 0, currency)}</Text>
            )}

            {splitType === 'PERCENTAGE' && (
              <TextInput
                style={styles.input}
                value={row.percentage}
                onChangeText={(value) => setRowField(row.id, 'percentage', value)}
                keyboardType="numeric"
                placeholder="%"
              />
            )}

            {splitType === 'EXACT' && (
              <TextInput
                style={styles.input}
                value={row.exactAmount}
                onChangeText={(value) => setRowField(row.id, 'exactAmount', value)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            )}

            {splitType === 'SHARES' && (
              <TextInput
                style={styles.input}
                value={row.shares}
                onChangeText={(value) => setRowField(row.id, 'shares', value)}
                keyboardType="numeric"
                placeholder="1"
              />
            )}
          </View>
        ))}

        <View style={[styles.validationBox, { borderColor: validation.valid ? '#9ED8AE' : '#F2AAAA' }]}>
          <Text style={{ color: validation.valid ? '#1D7A3A' : '#AF2E2E', fontWeight: '700' }}>
            {validation.text}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerAction: { color: colors.primary, fontWeight: '700' },
  hero: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  expenseName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  total: { marginTop: 4, color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F6F9',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  content: { padding: 14, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F4',
    paddingVertical: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  name: { marginLeft: 10, color: colors.text, fontSize: 14, fontWeight: '600' },
  amount: { color: colors.text, fontSize: 13, fontWeight: '700' },
  input: {
    width: 90,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  validationBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FDFEFE',
  },
});

export default SplitWizardScreen;
