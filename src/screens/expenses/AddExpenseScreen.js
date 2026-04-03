import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/buttons/Button';
import CurrencyInput from '../../components/inputs/CurrencyInput';
import DatePickerField from '../../components/inputs/DatePickerField';
import InputField from '../../components/inputs/InputField';
import SelectField from '../../components/inputs/SelectField';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useExpenses } from '../../hooks/useExpenses';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../hooks/useGroups';
;

const AddExpenseScreen = ({ navigation, route }) => {
  const { addExpense, isLoading } = useExpenses();
  const { groups, fetchGroups } = useGroups();
  const { friends, fetchFriends } = useFriends();
  
  const initialGroupId = route.params?.groupId || null;
  const initialFriendId = route.params?.friendId || null;

  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    date: new Date(),
    paidBy: 'me',
    category: 'General',
    groupId: initialGroupId,
    splitWith: initialFriendId ? [initialFriendId] : [],
    splitType: 'EQUAL',
  });

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

  const categories = [
    { name: 'Food', icon: 'silverware-fork-knife' },
    { name: 'Travel', icon: 'car' },
    { name: 'Shopping', icon: 'shopping' },
    { name: 'Bills', icon: 'file-document-outline' },
    { name: 'Rent', icon: 'home-outline' },
    { name: 'Health', icon: 'dumbbell' },
    { name: 'Entertainment', icon: 'movie-outline' },
    { name: 'General', icon: 'dots-horizontal' },
  ];

  const handleSave = async () => {
    if (!form.description || !form.amount) {
      Alert.alert('Error', 'Please fill in description and amount');
      return;
    }

    try {
      const expenseData = {
        ...form,
        amount: parseFloat(form.amount),
        date: form.date.toISOString(),
      };
      await addExpense(expenseData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add expense');
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Add Expense" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Description</Text>
        <InputField 
          placeholder="What was it for?" 
          value={form.description} 
          onChangeText={(t) => setForm({...form, description: t})} 
        />

        <View style={styles.row}>
          <View style={{ flex: 2, marginRight: 16 }}>
            <Text style={styles.label}>Amount</Text>
            <CurrencyInput 
              value={form.amount} 
              onChangeValue={(t) => setForm({...form, amount: t})} 
              placeholder="0.00"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Currency</Text>
            <TouchableOpacity style={styles.selector}>
              <Text style={styles.selectorText}>{form.currency}</Text>
              <Icon name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={styles.label}>Date</Text>
            <DatePickerField 
              value={form.date}
              onChange={(d) => setForm({...form, date: d})}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Group (Optional)</Text>
            <SelectField
              placeholder="Select Group"
              value={form.groupId}
              options={groups.map(g => ({ label: g.name, value: g.id }))}
              onValueChange={(v) => setForm({...form, groupId: v})}
            />
          </View>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.categoryItem, form.category === cat.name && styles.activeCategory]}
              onPress={() => setForm({...form, category: cat.name})}
            >
              <View style={[styles.categoryIcon, form.category === cat.name && styles.activeCategoryIcon]}>
                <Icon name={cat.icon} size={24} color={form.category === cat.name ? colors.primary : colors.textSecondary} />
              </View>
              <Text style={[styles.categoryText, form.category === cat.name && styles.activeCategoryText]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.splitCard}>
          <View style={styles.splitHeader}>
            <View style={styles.splitIcon}>
              <Icon name="account-group" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.splitTitle}>Split with friends</Text>
              <Text style={styles.splitSubtitle}>Divide cost with others</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </View>

        <Button 
          title="Save Expense" 
          style={styles.saveBtn} 
          onPress={handleSave} 
          loading={isLoading}
        />
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  selectorText: {
    fontSize: 16,
    color: colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  activeCategoryIcon: {
    borderColor: colors.primary,
    backgroundColor: '#E0F7FA',
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: colors.text,
  },
  splitCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  splitSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveBtn: {
    height: 60,
    borderRadius: 30,
    marginBottom: 40,
  },
});

export default AddExpenseScreen;
