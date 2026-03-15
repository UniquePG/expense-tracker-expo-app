import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, Chip, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { expensesApi } from '../../api/expensesApi';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { SPLIT_TYPES } from '../../constants/constants';
import { useExpenses } from '../../hooks/useExpenses';
import { formatDateTime } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';

export const ExpenseDetailsScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const {deleteExpense} = useExpenses();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await expensesApi.getExpenseDetails(id);
      setExpense(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expense details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  }, [id, deleteExpense, navigation]);

  const handleEdit = () => {
    navigation.navigate('EditExpense', {id});
  };

  const getSplitTypeLabel = (type) => {
    switch (type) {
      case SPLIT_TYPES.EQUAL: return 'Split equally';
      case SPLIT_TYPES.PERCENTAGE: return 'Split by percentage';
      case SPLIT_TYPES.EXACT: return 'Split by exact amounts';
      case SPLIT_TYPES.SHARES: return 'Split by shares';
      default: return 'Custom split';
    }
  };

  if (!expense) {
    return <LoadingOverlay visible={true} />;
  }

  const isCreator = expense.createdBy?.isCurrentUser;
  const userShare = expense.participants?.find(p => p.isCurrentUser);

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Expense Details"
        onBack={() => navigation.goBack()}
        rightAction={
          isCreator && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                />
              }>
              <Menu.Item
                onPress={handleEdit}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={handleDelete}
                title="Delete"
                leadingIcon="delete"
                titleStyle={{color: theme.colors.error}}
              />
            </Menu>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, {color: theme.colors.text}]}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
          <Text style={[styles.description, {color: theme.colors.text}]}>
            {expense.description}
          </Text>
          <Text style={[styles.date, {color: theme.colors.textSecondary}]}>
            {formatDateTime(expense.date)}
          </Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon name="tag" size={20} color={theme.colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                Category
              </Text>
              <View style={styles.categoryContainer}>
                <View
                  style={[
                    styles.categoryDot,
                    {backgroundColor: expense.category?.color || theme.colors.primary},
                  ]}
                />
                <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                  {expense.category?.name || 'Uncategorized'}
                </Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.detailRow}>
            <Icon name="account" size={20} color={theme.colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                Paid By
              </Text>
              <View style={styles.paidByContainer}>
                <Avatar
                  source={expense.paidBy?.avatar ? {uri: expense.paidBy.avatar} : null}
                  firstName={expense.paidBy?.firstName}
                  lastName={expense.paidBy?.lastName}
                  size={24}
                />
                <Text style={[styles.detailValue, {color: theme.colors.text, marginLeft: 8}]}>
                  {expense.paidBy?.isCurrentUser ? 'You' : `${expense.paidBy?.firstName} ${expense.paidBy?.lastName}`}
                </Text>
              </View>
            </View>
          </View>

          {expense.group && (
            <>
              <Divider />
              <View style={styles.detailRow}>
                <Icon name="account-group" size={20} color={theme.colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                    Group
                  </Text>
                  <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                    {expense.group.name}
                  </Text>
                </View>
              </View>
            </>
          )}

          {expense.notes && (
            <>
              <Divider />
              <View style={styles.detailRow}>
                <Icon name="note-text" size={20} color={theme.colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                    Notes
                  </Text>
                  <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                    {expense.notes}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Card>

        <View style={styles.splitSection}>
          <View style={styles.splitHeader}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Split Details
            </Text>
            <Chip icon="information" style={styles.splitChip}>
              {getSplitTypeLabel(expense.split?.type)}
            </Chip>
          </View>

          {expense.participants?.map(participant => (
            <Card key={participant.userId} style={styles.participantCard}>
              <View style={styles.participantRow}>
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
                  <Text style={[styles.participantShare, {color: theme.colors.textSecondary}]}>
                    {expense.split?.type === SPLIT_TYPES.PERCENTAGE && `${participant.percentage}% • `}
                    {expense.split?.type === SPLIT_TYPES.SHARES && `${participant.shares} share${participant.shares !== 1 ? 's' : ''} • `}
                    owes {formatCurrency(participant.amountOwed, expense.currency)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.participantAmount,
                    {
                      color: participant.isCurrentUser
                        ? participant.amountOwed > 0
                          ? theme.colors.expense
                          : theme.colors.income
                        : theme.colors.text,
                    },
                  ]}>
                  {participant.isCurrentUser && participant.amountOwed > 0 ? '-' : ''}
                  {formatCurrency(Math.abs(participant.amountOwed), expense.currency)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {userShare && (
          <Card
            style={[
              styles.yourShareCard,
              {
                backgroundColor: userShare.amountOwed > 0 ? theme.colors.expense + '10' : theme.colors.income + '10',
                borderColor: userShare.amountOwed > 0 ? theme.colors.expense : theme.colors.income,
              },
            ]}>
            <Text style={[styles.yourShareLabel, {color: theme.colors.textSecondary}]}>
              Your Share
            </Text>
            <Text
              style={[
                styles.yourShareAmount,
                {
                  color: userShare.amountOwed > 0 ? theme.colors.expense : theme.colors.income,
                },
              ]}>
              {userShare.amountOwed > 0 ? 'You owe ' : 'You are owed '}
              {formatCurrency(Math.abs(userShare.amountOwed), expense.currency)}
            </Text>
          </Card>
        )}

        {expense.receipt && (
          <Card style={styles.receiptCard}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Receipt
            </Text>
            <Image
              source={{uri: expense.receipt}}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </Card>
        )}

        {isCreator && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleEdit}
              style={styles.actionButton}
              icon="pencil">
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={[styles.actionButton, {borderColor: theme.colors.error}]}
              textColor={theme.colors.error}
              icon="delete">
              Delete
            </Button>
          </View>
        )}
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  paidByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitSection: {
    marginTop: 8,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  splitChip: {
    height: 32,
  },
  participantCard: {
    marginBottom: 8,
    padding: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  participantShare: {
    fontSize: 12,
    marginTop: 2,
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  yourShareCard: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  yourShareLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  yourShareAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  receiptCard: {
    marginTop: 16,
    padding: 16,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});