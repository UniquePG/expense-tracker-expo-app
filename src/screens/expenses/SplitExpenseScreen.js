import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Text, useTheme, Button, Chip} from 'react-native-paper';
import {useExpenses} from '../../hooks/useExpenses';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {Avatar} from '../../components/ui/Avatar';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {SPLIT_TYPES} from '../../constants/constants';
import {formatCurrency} from '../../utils/formatCurrency';

const SPLIT_OPTIONS = [
  {key: SPLIT_TYPES.EQUAL, label: 'Equal'},
  {key: SPLIT_TYPES.PERCENTAGE, label: 'Percentage'},
  {key: SPLIT_TYPES.EXACT, label: 'Exact'},
  {key: SPLIT_TYPES.SHARES, label: 'Shares'},
];

export const SplitExpenseScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const {currentExpense, updateSplit, isLoading} = useExpenses();
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [participants, setParticipants] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (currentExpense) {
      setTotalAmount(currentExpense.amount);
      setSplitType(currentExpense.split?.type || SPLIT_TYPES.EQUAL);
      setParticipants(currentExpense.participants?.map(p => ({
        ...p,
        selected: true,
        percentage: p.percentage || 0,
        shares: p.shares || 1,
        amount: p.amountOwed || 0,
      })) || []);
    }
  }, [currentExpense]);

  const updateCalculations = () => {
    const selected = participants.filter(p => p.selected);
    const count = selected.length;

    setParticipants(prev => prev.map(p => {
      if (!p.selected) return {...p, amount: 0};

      let newAmount = 0;
      let newPercentage = p.percentage;

      switch (splitType) {
        case SPLIT_TYPES.EQUAL:
          newAmount = totalAmount / count;
          newPercentage = 100 / count;
          break;
        case SPLIT_TYPES.PERCENTAGE:
          newAmount = (totalAmount * p.percentage) / 100;
          break;
        case SPLIT_TYPES.EXACT:
          // Keep manual amount
          break;
        case SPLIT_TYPES.SHARES:
          const totalShares = selected.reduce((sum, sp) => sum + sp.shares, 0);
          newAmount = (totalAmount * p.shares) / totalShares;
          newPercentage = (p.shares / totalShares) * 100;
          break;
      }

      return {...p, amount: newAmount, percentage: newPercentage};
    }));
  };

  useEffect(() => {
    updateCalculations();
  }, [splitType]);

  const toggleParticipant = (userId) => {
    setParticipants(prev => prev.map(p => 
      p.userId === userId ? {...p, selected: !p.selected} : p
    ));
  };

  const updateField = (userId, field, value) => {
    setParticipants(prev => prev.map(p => {
      if (p.userId !== userId) return p;
      const numValue = parseFloat(value) || 0;
      let updates = {[field]: numValue};

      if (splitType === SPLIT_TYPES.PERCENTAGE && field === 'percentage') {
        updates.amount = (totalAmount * numValue) / 100;
      } else if (splitType === SPLIT_TYPES.EXACT && field === 'amount') {
        updates.percentage = (numValue / totalAmount) * 100;
      } else if (splitType === SPLIT_TYPES.SHARES && field === 'shares') {
        const selected = participants.filter(sp => sp.selected);
        const totalShares = selected.reduce((sum, sp) => 
          sum + (sp.userId === userId ? numValue : sp.shares), 0);
        updates.amount = (totalAmount * numValue) / totalShares;
        updates.percentage = (numValue / totalShares) * 100;
      }

      return {...p, ...updates};
    }));
  };

  const validateAndSave = async () => {
    const selected = participants.filter(p => p.selected);
    
    if (selected.length === 0) {
      Alert.alert('Error', 'At least one participant must be selected');
      return;
    }

    const totalSplit = selected.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      Alert.alert('Error', `Split amounts must equal total: ${formatCurrency(totalAmount)}`);
      return;
    }

    try {
      const splitData = {
        type: splitType,
        participants: selected.map(p => ({
          userId: p.userId,
          amount: p.amount,
          percentage: p.percentage,
          shares: p.shares,
        })),
      };

      await updateSplit(id, splitData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update split');
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Edit Split"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, {color: theme.colors.textSecondary}]}>
            Total Amount
          </Text>
          <Text style={[styles.totalAmount, {color: theme.colors.text}]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Split Type
        </Text>
        
        <View style={styles.splitTypeContainer}>
          {SPLIT_OPTIONS.map(option => (
            <Chip
              key={option.key}
              selected={splitType === option.key}
              onPress={() => setSplitType(option.key)}
              style={styles.splitTypeChip}>
              {option.label}
            </Chip>
          ))}
        </View>

        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
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
                firstName={participant.firstName}
                lastName={participant.lastName}
                size={40}
              />

              <View style={styles.participantInfo}>
                <Text style={[styles.participantName, {color: theme.colors.text}]}>
                  {participant.isCurrentUser ? 'You' : `${participant.firstName} ${participant.lastName}`}
                </Text>
              </View>

              {participant.selected && splitType !== SPLIT_TYPES.EQUAL && (
                <View style={styles.inputContainer}>
                  {splitType === SPLIT_TYPES.PERCENTAGE && (
                    <InputField
                      value={participant.percentage.toString()}
                      onChangeText={(val) => updateField(participant.userId, 'percentage', val)}
                      keyboardType="numeric"
                      style={styles.smallInput}
                    />
                  )}
                  {splitType === SPLIT_TYPES.EXACT && (
                    <InputField
                      value={participant.amount.toString()}
                      onChangeText={(val) => updateField(participant.userId, 'amount', val)}
                      keyboardType="numeric"
                      style={styles.smallInput}
                    />
                  )}
                  {splitType === SPLIT_TYPES.SHARES && (
                    <InputField
                      value={participant.shares.toString()}
                      onChangeText={(val) => updateField(participant.userId, 'shares', val)}
                      keyboardType="numeric"
                      style={styles.smallInput}
                    />
                  )}
                </View>
              )}

              {participant.selected && (
                <Text style={[styles.amount, {color: theme.colors.textSecondary}]}>
                  {formatCurrency(participant.amount)}
                </Text>
              )}
            </View>
          </Card>
        ))}

        <View style={styles.summary}>
          <Text style={[styles.summaryText, {color: theme.colors.textSecondary}]}>
            Total: {formatCurrency(participants.filter(p => p.selected).reduce((sum, p) => sum + p.amount, 0))} / {formatCurrency(totalAmount)}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={validateAndSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}>
          Save Split
        </Button>
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  splitTypeChip: {
    marginRight: 8,
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
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    width: 80,
    marginRight: 8,
  },
  smallInput: {
    marginBottom: 0,
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  summary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
  },
  saveButton: {
    marginTop: 24,
  },
});