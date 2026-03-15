import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {Text, useTheme, Snackbar, Chip, Button as PaperButton, Icon} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {expenseSchema} from '../../utils/validationSchemas';
import {useExpenses} from '../../hooks/useExpenses';
import {useGroups} from '../../hooks/useGroups';
import {useFriends} from '../../hooks/useFriends';
import {expensesApi} from '../../api/expensesApi';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {CurrencyInput} from '../../components/inputs/CurrencyInput';
import {SelectField} from '../../components/inputs/SelectField';
import {DatePickerField} from '../../components/inputs/DatePickerField';
import {ImagePickerField} from '../../components/inputs/ImagePickerField';
import {Button} from '../../components/buttons/Button';
import {Avatar} from '../../components/ui/Avatar';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {EXPENSE_CATEGORIES, SPLIT_TYPES} from '../../constants/constants';
import {formatCurrency} from '../../utils/formatCurrency';

const SPLIT_OPTIONS = [
  {key: SPLIT_TYPES.EQUAL, label: 'Equal', icon: 'equal'},
  {key: SPLIT_TYPES.PERCENTAGE, label: 'Percentage', icon: 'percent'},
  {key: SPLIT_TYPES.EXACT, label: 'Exact', icon: 'cash'},
  {key: SPLIT_TYPES.SHARES, label: 'Shares', icon: 'chart-pie'},
];

export const CreateExpenseScreen = ({navigation, route}) => {
  const theme = useTheme();
  const {groupId, friendId} = route.params || {};
  const {createExpense} = useExpenses();
  const {groups} = useGroups();
  const {friends} = useFriends({autoFetch: true});
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [participants, setParticipants] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(groupId || null);
  const [paidBy, setPaidBy] = useState('me');

  const {
    control,
    handleSubmit,
    watch,
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

  const amount = watch('amount');

  useEffect(() => {
    // Initialize participants
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group) {
        setParticipants(group.members.map(m => ({
          userId: m.id,
          name: `${m.firstName} ${m.lastName}`,
          avatar: m.avatar,
          amount: 0,
          percentage: 100 / group.members.length,
          shares: 1,
          selected: true,
        })));
      }
    } else if (friendId) {
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
        setParticipants([
          {userId: 'me', name: 'You', selected: true, amount: 0, percentage: 50, shares: 1},
          {userId: friend.id, name: `${friend.firstName} ${friend.lastName}`, avatar: friend.avatar, selected: true, amount: 0, percentage: 50, shares: 1},
        ]);
      }
    } else {
      setParticipants([
        {userId: 'me', name: 'You', selected: true, amount: 0, percentage: 100, shares: 1},
      ]);
    }
  }, [selectedGroup, friendId, groups, friends]);

  const updateSplitCalculations = () => {
    if (!amount || amount <= 0) return;

    const selectedParticipants = participants.filter(p => p.selected);
    const count = selectedParticipants.length;

    if (count === 0) return;

    setParticipants(prev => prev.map(p => {
      if (!p.selected) return {...p, amount: 0, percentage: 0};

      let newAmount = 0;
      let newPercentage = p.percentage;
      let newShares = p.shares;

      switch (splitType) {
        case SPLIT_TYPES.EQUAL:
          newAmount = amount / count;
          newPercentage = 100 / count;
          newShares = 1;
          break;
        case SPLIT_TYPES.PERCENTAGE:
          newAmount = (amount * p.percentage) / 100;
          break;
        case SPLIT_TYPES.EXACT:
          // Keep manually entered amount
          break;
        case SPLIT_TYPES.SHARES:
          const totalShares = selectedParticipants.reduce((sum, sp) => sum + sp.shares, 0);
          newAmount = (amount * p.shares) / totalShares;
          newPercentage = (p.shares / totalShares) * 100;
          break;
      }

      return {...p, amount: newAmount, percentage: newPercentage, shares: newShares};
    }));
  };

  useEffect(() => {
    updateSplitCalculations();
  }, [amount, splitType]);

  const toggleParticipant = (userId) => {
    setParticipants(prev => prev.map(p => 
      p.userId === userId ? {...p, selected: !p.selected} : p
    ));
  };

  const updateParticipantField = (userId, field, value) => {
    setParticipants(prev => prev.map(p => {
      if (p.userId !== userId) return p;
      return {...p, [field]: value};
    }));
  };

  const validateSplit = () => {
    const selected = participants.filter(p => p.selected);
    if (selected.length === 0) {
      setError('At least one participant must be selected');
      return false;
    }

    const totalAmount = selected.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    if (Math.abs(totalAmount - amount) > 0.01) {
      setError(`Split amounts must equal total: ${formatCurrency(amount)} (current: ${formatCurrency(totalAmount)})`);
      return false;
    }

    if (splitType === SPLIT_TYPES.PERCENTAGE) {
      const totalPercentage = selected.reduce((sum, p) => sum + (p.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setError(`Percentages must equal 100% (current: ${totalPercentage.toFixed(1)}%)`);
        return false;
      }
    }

    return true;
  };

  const onSubmit = async (data) => {
    if (!validateSplit()) return;

    try {
      setIsLoading(true);
      setError(null);

      const splitData = {
        type: splitType,
        participants: participants
          .filter(p => p.selected)
          .map(p => ({
            userId: p.userId,
            amount: parseFloat(p.amount),
            percentage: parseFloat(p.percentage),
            shares: parseInt(p.shares),
          })),
      };

      const expenseData = {
        ...data,
        groupId: selectedGroup,
        paidById: paidBy === 'me' ? 'current_user_id' : paidBy,
        split: splitData,
      };

      const result = await createExpense(expenseData);
      
      if (data.receipt) {
        await expensesApi.uploadReceipt(result.data.id, data.receipt);
      }

      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const groupOptions = groups.map(g => ({label: g.name, value: g.id}));

  const renderSplitSection = () => (
    <View style={styles.splitSection}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Split Options
      </Text>
      
      <View style={styles.splitTypeContainer}>
        {SPLIT_OPTIONS.map(option => (
          <PaperButton
            key={option.key}
            mode={splitType === option.key ? 'contained' : 'outlined'}
            onPress={() => setSplitType(option.key)}
            style={styles.splitTypeButton}
            icon={option.icon}
            compact>
            {option.label}
          </PaperButton>
        ))}
      </View>

      <Text style={[styles.subsectionTitle, {color: theme.colors.text}]}>
        Participants
      </Text>

      {participants.map(participant => (
        <Card key={participant.userId} style={styles.participantCard}>
          <View style={styles.participantRow}>
            <TouchableOpacity
              onPress={() => toggleParticipant(participant.userId)}
              style={styles.checkbox}>
              <Icon
                name={participant.selected ? 'check-circle' : 'circle-outline'}
                size={24}
                color={participant.selected ? theme.colors.primary : theme.colors.textDisabled}
              />
            </TouchableOpacity>
            
            <Avatar
              source={participant.avatar ? {uri: participant.avatar} : null}
              firstName={participant.name.split(' ')[0]}
              lastName={participant.name.split(' ')[1]}
              size={36}
            />
            
            <Text style={[styles.participantName, {color: theme.colors.text}]}>
              {participant.name}
            </Text>

            {participant.selected && splitType !== SPLIT_TYPES.EQUAL && (
              <View style={styles.splitInput}>
                {splitType === SPLIT_TYPES.PERCENTAGE && (
                  <InputField
                    value={participant.percentage.toString()}
                    onChangeText={(val) => {
                      updateParticipantField(participant.userId, 'percentage', parseFloat(val) || 0);
                      updateParticipantField(participant.userId, 'amount', (amount * parseFloat(val)) / 100);
                    }}
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                )}
                {splitType === SPLIT_TYPES.EXACT && (
                  <InputField
                    value={participant.amount.toString()}
                    onChangeText={(val) => {
                      updateParticipantField(participant.userId, 'amount', parseFloat(val) || 0);
                      updateParticipantField(participant.userId, 'percentage', (parseFloat(val) / amount) * 100);
                    }}
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                )}
                {splitType === SPLIT_TYPES.SHARES && (
                  <InputField
                    value={participant.shares.toString()}
                    onChangeText={(val) => {
                      const shares = parseInt(val) || 0;
                      updateParticipantField(participant.userId, 'shares', shares);
                      const totalShares = participants
                        .filter(p => p.selected)
                        .reduce((sum, p) => sum + (p.userId === participant.userId ? shares : p.shares), 0);
                      updateParticipantField(participant.userId, 'amount', (amount * shares) / totalShares);
                    }}
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                )}
              </View>
            )}

            {participant.selected && (
              <Text style={[styles.participantAmount, {color: theme.colors.textSecondary}]}>
                {formatCurrency(participant.amount)}
              </Text>
            )}
          </View>
        </Card>
      ))}

      <View style={styles.splitSummary}>
        <Text style={[styles.summaryLabel, {color: theme.colors.textSecondary}]}>
          Total Split: {formatCurrency(participants.filter(p => p.selected).reduce((sum, p) => sum + p.amount, 0))} / {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );

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
          
          {!groupId && !friendId && (
            <SelectField
              label="Group (Optional)"
              value={selectedGroup}
              options={[{label: 'No Group', value: null}, ...groupOptions]}
              onSelect={setSelectedGroup}
              placeholder="Select a group or keep personal"
            />
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

          <View style={styles.paidBySection}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Paid By
            </Text>
            <View style={styles.paidByOptions}>
              <Chip
                selected={paidBy === 'me'}
                onPress={() => setPaidBy('me')}
                style={styles.paidByChip}>
                You
              </Chip>
              {participants.filter(p => p.userId !== 'me').map(p => (
                <Chip
                  key={p.userId}
                  selected={paidBy === p.userId}
                  onPress={() => setPaidBy(p.userId)}
                  style={styles.paidByChip}>
                  {p.name}
                </Chip>
              ))}
            </View>
          </View>

          {renderSplitSection()}

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

      <LoadingOverlay visible={isLoading} message="Creating expense..." />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={5000}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  paidBySection: {
    marginVertical: 8,
  },
  paidByOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paidByChip: {
    marginRight: 8,
  },
  splitSection: {
    marginVertical: 8,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  splitTypeButton: {
    flex: 1,
    minWidth: 80,
  },
  participantCard: {
    marginBottom: 8,
    padding: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  participantName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  splitInput: {
    width: 80,
    marginRight: 8,
  },
  smallInput: {
    marginBottom: 0,
  },
  participantAmount: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  splitSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 24,
  },
});