import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { accountsApi, categoriesApi, expensesApi, groupsApi, transactionsApi } from '../../api';
import DatePickerField from '../../components/inputs/DatePickerField';
import Header from '../../components/ui/Header';
import ImagePickerField from '../../components/ui/ImagePickerField';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

const getItemsFromResponse = (response, key) => {
  const root = response?.data ?? response;
  if (Array.isArray(root?.[key])) return root[key];
  if (Array.isArray(root)) return root;
  return [];
};

const AddExpenseScreen = ({ navigation, route }) => {
  const authUser = useAuthStore((s) => s.user);
  const amountInputRef = useRef(null);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'INR',
    categoryId: '',
    expenseDate: new Date(),
    groupId: route.params?.groupId || '',
    notes: '',
    receipt: null,
    accountId: '',
  });

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [accountRes, categoryRes, groupRes] = await Promise.all([
          accountsApi.getAll(),
          categoriesApi.getAll(),
          groupsApi.getAll(),
        ]);

        const accountList = getItemsFromResponse(accountRes, 'accounts');
        const categoryList = getItemsFromResponse(categoryRes, 'categories');
        const groupList = getItemsFromResponse(groupRes, 'groups');

        setAccounts(accountList);
        setCategories(categoryList);
        setGroups(groupList);

        // Set default currency from first account
        if (accountList.length > 0 && !form.currency) {
          setForm((prev) => ({ ...prev, currency: accountList[0].currency || 'INR' }));
        }
        
        // Auto focus the amount input on load
        setTimeout(() => {
            amountInputRef.current?.focus();
        }, 500);

      } catch (error) {
        Alert.alert('Error', 'Failed to load expense form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const amount = parseFloat(form.amount);

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length > 255) {
      newErrors.description = 'Description max 255 characters';
    }

    if (!form.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (form.expenseDate > new Date()) {
      newErrors.expenseDate = 'Expense date cannot be in the future';
    }

    if (form.notes.length > 500) {
      newErrors.notes = 'Notes max 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(form.amount);

    const payload = {
      description: form.description.trim(),
      amount,
      currency: form.currency || 'INR',
      categoryId: form.categoryId || undefined,
      expenseDate: form.expenseDate.toISOString(),
      groupId: form.groupId || undefined,
      notes: form.notes.trim() || undefined,
      accountId: form.accountId || undefined,
    };

    setIsSaving(true);
    try {
      const response = await transactionsApi.createExpense(payload);
      const createdExpense = response?.data?.transaction || response?.transaction || response?.data || response;
      const expenseId = createdExpense?.id;

      // Upload receipt if provided
      if (form.receipt?.uri && expenseId) {
        try {
          const formData = new FormData();
          formData.append('receipt', {
            uri: form.receipt.uri,
            name: form.receipt.fileName || `receipt_${Date.now()}.jpg`,
            type: form.receipt.type || 'image/jpeg',
          });
          await expensesApi.uploadReceipt(expenseId, formData);
        } catch (receiptError) {
          console.warn('Failed to upload receipt:', receiptError);
        }
      }

      navigation.goBack();
      
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create expense';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper backgroundColor={colors.white}>
        <Header title="Add Expense" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  // Pick top 8 categories for quick selection
  const topCategories = categories.slice(0, 8);
  const selectedCategoryObj = categories.find(c => c.id === form.categoryId);

  return (
    <ScreenWrapper backgroundColor={colors.white}>
      <Header title="New Expense" showBack onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView 
         style={{ flex: 1 }} 
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* HER0 AMOUNT SECTION */}
            <View style={styles.heroAmountContainer}>
                <Text style={styles.heroCurrencySymbol}>₹</Text>
                <TextInput
                    ref={amountInputRef}
                    style={[styles.heroAmountInput, errors.amount && styles.heroAmountError]}
                    placeholder="0.00"
                    placeholderTextColor="rgba(0,0,0,0.2)"
                    value={form.amount}
                    onChangeText={(text) => {
                        setForm({ ...form, amount: text });
                        if (text && !isNaN(parseFloat(text))) {
                        setErrors((prev) => ({ ...prev, amount: null }));
                        }
                    }}
                    keyboardType="decimal-pad"
                    selectionColor={colors.primary}
                />
            </View>
            {errors.amount && <Text style={styles.errorTextCenter}>{errors.amount}</Text>}

            {/* QUICK CATEGORY CHIPS */}
            <View style={styles.categoryWrapSection}>
                <Text style={styles.sectionLabel}>Category</Text>
                
                <View style={styles.chipsWrap}>
                    {topCategories.map((cat) => {
                        const isSelected = form.categoryId === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    isSelected && { backgroundColor: (cat.color || colors.primary) + '20', borderColor: cat.color || colors.primary }
                                ]}
                                onPress={() => setForm({ ...form, categoryId: cat.id })}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={cat.icon || 'tag'} 
                                    size={20} 
                                    color={isSelected ? (cat.color || colors.primary) : colors.textSecondary} 
                                />
                                <Text style={[
                                    styles.chipText,
                                    isSelected && { color: (cat.color || colors.primary), fontWeight: '700' }
                                ]}>{cat.name}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        style={[styles.categoryChip, showAllCategories && styles.categoryChipActiveSystem]}
                        onPress={() => setShowAllCategories(!showAllCategories)}
                        activeOpacity={0.7}
                    >
                        <Icon name="dots-horizontal" size={20} color={showAllCategories ? colors.primary : colors.textSecondary} />
                        <Text style={[styles.chipText, showAllCategories && { color: colors.primary, fontWeight: '700' }]}>More</Text>
                    </TouchableOpacity>
                </View>

                {/* SHOW ALL CATEGORIES DROPDOWN IF REQUESTED */}
                {(showAllCategories || (form.categoryId && !topCategories.find(c => c.id === form.categoryId))) && (
                    <View style={styles.pickerContainer}>
                        <Icon name="tag-outline" size={20} color={colors.textSecondary} style={styles.pickerIcon} />
                        <Picker
                            selectedValue={form.categoryId}
                            onValueChange={(value) => setForm({ ...form, categoryId: value })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Category..." value="" color={colors.textSecondary} />
                            {categories.map((category) => (
                                <Picker.Item key={category.id} label={category.name} value={category.id} />
                            ))}
                        </Picker>
                    </View>
                )}
            </View>

            {/* MODERN FORM FIELD STYLING */}
            <View style={styles.cardSection}>
                {/* Description */}
                <View style={styles.fieldWrapper}>
                    <Icon name="pencil" size={22} color={colors.textSecondary} style={styles.fieldIcon} />
                    <View style={styles.fieldInputBlock}>
                        <Text style={styles.miniLabel}>What was this for?</Text>
                        <TextInput
                            style={styles.cleanInput}
                            placeholder="Enter description..."
                            value={form.description}
                            onChangeText={(text) => {
                                setForm({ ...form, description: text });
                                if (text && text.length <= 255) {
                                    setErrors((prev) => ({ ...prev, description: null }));
                                }
                            }}
                            maxLength={255}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>
                {errors.description && <Text style={styles.errorTextBox}>{errors.description}</Text>}
                
                <View style={styles.divider} />

                {/* Date */}
                <View style={styles.fieldWrapper}>
                    <Icon name="calendar-today" size={22} color={colors.textSecondary} style={styles.fieldIcon} />
                    <View style={styles.fieldInputBlockFlex}>
                        <DatePickerField
                            value={form.expenseDate}
                            onChange={(date) => {
                                setForm({ ...form, expenseDate: date });
                                if (date <= new Date()) {
                                    setErrors((prev) => ({ ...prev, expenseDate: null }));
                                }
                            }}
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Group */}
                <View style={styles.fieldWrapper}>
                    <Icon name="account-group-outline" size={22} color={colors.textSecondary} style={styles.fieldIcon} />
                    <View style={styles.fieldInputBlock}>
                        <Text style={styles.miniLabel}>Split with Group?</Text>
                        <Picker
                            selectedValue={form.groupId}
                            onValueChange={(value) => setForm({ ...form, groupId: value })}
                            style={[styles.cleanPicker, { marginLeft: -16 }]}
                        >
                            <Picker.Item label="Personal (No Group)" value="" />
                            {groups.map((group) => (
                                <Picker.Item key={group.id} label={group.name} value={group.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Account */}
                <View style={styles.fieldWrapper}>
                    <Icon name="wallet-outline" size={22} color={colors.textSecondary} style={styles.fieldIcon} />
                    <View style={styles.fieldInputBlock}>
                        <Text style={styles.miniLabel}>Paid from</Text>
                        <Picker
                            selectedValue={form.accountId}
                            onValueChange={(value) => setForm({ ...form, accountId: value })}
                            style={[styles.cleanPicker, { marginLeft: -16 }]}
                        >
                            <Picker.Item label="No account linked" value="" />
                            {accounts.map((account) => (
                                <Picker.Item
                                    key={account.id}
                                    label={`${account.name} (${account.currency || 'INR'})`}
                                    value={account.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            {/* EXTENSIONS */}
            <View style={styles.cardSection}>
                {/* Notes */}
                <View style={styles.fieldWrapper}>
                    <Icon name="text-box-outline" size={22} color={colors.textSecondary} style={styles.fieldIcon} />
                    <View style={styles.fieldInputBlock}>
                        <Text style={styles.miniLabel}>Notes</Text>
                        <TextInput
                            style={styles.cleanTextArea}
                            placeholder="Add extra details..."
                            value={form.notes}
                            onChangeText={(text) => {
                                setForm({ ...form, notes: text });
                            }}
                            multiline
                            maxLength={500}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.cardSection}>
                {/* Receipt */}
                <View style={[styles.fieldWrapper, { paddingVertical: 8 }]}>
                   <View style={styles.fieldInputBlockFlex}>
                        <ImagePickerField 
                          label="Attach Receipt" 
                          value={form.receipt} 
                          onChange={(receipt) => setForm({ ...form, receipt })} 
                        />
                   </View>
                </View>
            </View>
            
            {/* Spacer for bottom save button */}
            <View style={styles.bottomSpacer} />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLOAT SAVE BUTTON */}
      <View style={styles.floatingActionBox}>
        <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
        >
            {isSaving ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <>
                <Text style={styles.saveButtonText}>Add Expense</Text>
                <Icon name="check" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                </>
            )}
        </TouchableOpacity>
      </View>
      
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  // Hero Styles
  heroAmountContainer: {
     flexDirection: 'row',
     alignItems: 'baseline',
     justifyContent: 'center',
     paddingVertical: 32,
     marginBottom: 10,
  },
  heroCurrencySymbol: {
     fontSize: 32,
     fontWeight: '600',
     color: colors.textSecondary,
     marginRight: 8,
  },
  heroAmountInput: {
     fontSize: 54,
     fontWeight: '800',
     color: colors.text,
     minWidth: 150,
     textAlign: 'left',
  },
  heroAmountError: {
     color: colors.error,
  },
  errorTextCenter: {
     color: colors.error,
     textAlign: 'center',
     marginTop: -20,
     marginBottom: 20,
     fontWeight: '500',
  },

  // Wrap sections
  categoryWrapSection: {
     marginBottom: 24,
  },
  sectionLabel: {
     fontSize: 15,
     fontWeight: '700',
     color: colors.textSecondary,
     marginBottom: 12,
     textTransform: 'uppercase',
     letterSpacing: 0.5,
  },
  chipsWrap: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: 10,
     marginBottom: 10,
  },
  categoryChip: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 10,
     paddingHorizontal: 14,
     borderRadius: 24,
     backgroundColor: '#FAFAFA',
     borderWidth: 1,
     borderColor: '#EEEEEE',
     gap: 8,
  },
  categoryChipActiveSystem: {
     backgroundColor: colors.primary + '20',
     borderColor: colors.primary,
  },
  chipText: {
     fontSize: 14,
     fontWeight: '500',
     color: colors.textSecondary,
  },

  // Fallback Picker
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: '#FAFAFA',
    marginTop: 8,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 56,
  },

  // Card Blocks
  cardSection: {
     backgroundColor: '#FAFAFA',
     borderRadius: 20,
     borderWidth: 1,
     borderColor: '#F0F0F0',
     marginBottom: 20,
     overflow: 'hidden',
  },
  fieldWrapper: {
     flexDirection: 'row',
     paddingVertical: 16,
     paddingHorizontal: 16,
     alignItems: 'center',
  },
  fieldIcon: {
     width: 32,
     marginTop: 4,
     alignSelf: 'flex-start',
  },
  fieldInputBlock: {
     flex: 1,
     justifyContent: 'center',
  },
  fieldInputBlockFlex: {
     flex: 1,
  },
  miniLabel: {
     fontSize: 12,
     fontWeight: '600',
     color: colors.textSecondary,
     marginBottom: 4,
  },
  cleanInput: {
     fontSize: 16,
     fontWeight: '500',
     color: colors.text,
     paddingTop: 4,
     paddingBottom: 4,
  },
  cleanTextArea: {
     fontSize: 16,
     fontWeight: '500',
     color: colors.text,
     paddingTop: 4,
     paddingBottom: 4,
     minHeight: 60,
  },
  cleanPicker: {
    height: 48,
    width: '100%',
  },
  divider: {
     height: 1,
     backgroundColor: '#EEEEEE',
     marginLeft: 48, // aligns with input block
  },
  errorTextBox: {
     color: colors.error,
     fontSize: 12,
     marginLeft: 48,
     marginBottom: 12,
     marginTop: -8,
  },

  // Save Bottom Float
  bottomSpacer: {
     height: 100,
  },
  floatingActionBox: {
     position: 'absolute',
     bottom: 0,
     left: 0,
     right: 0,
     paddingHorizontal: 20,
     paddingVertical: 20,
     backgroundColor: colors.white,
     borderTopWidth: 1,
     borderColor: '#F0F0F0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default AddExpenseScreen;
