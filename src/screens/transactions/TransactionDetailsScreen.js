import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { transactionsApi } from '../../api/transactionsApi';
import { Card } from '../../components/ui/Card';
import { Divider } from '../../components/ui/Divider';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { formatDateTime } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/formatCurrency';

export const TransactionDetailsScreen = ({navigation, route}) => {
  const {id} = route.params;
  const theme = useTheme();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      setIsLoading(true);
      const response = await transactionsApi.getTransactionDetails(id);
      setTransaction(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await transactionsApi.deleteTransaction(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // Navigate to edit screen
    // navigation.navigate('EditTransaction', {id});
  };

  if (!transaction) {
    return <LoadingOverlay visible={true} />;
  }

  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? theme.colors.expense : theme.colors.income;

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Transaction Details"
        onBack={() => navigation.goBack()}
        rightAction={
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
              titleStyle={{color: theme.colors.error}}
            />
          </Menu>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, {color: amountColor}]}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
          </Text>
          <Text style={[styles.type, {color: theme.colors.textSecondary}]}>
            {isExpense ? 'Expense' : 'Income'}
          </Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon
              name="pencil"
              size={20}
              color={theme.colors.textSecondary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                Description
              </Text>
              <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                {transaction.description}
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.detailRow}>
            <Icon
              name={isExpense ? 'arrow-up' : 'arrow-down'}
              size={20}
              color={theme.colors.textSecondary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                Category
              </Text>
              <View style={styles.categoryContainer}>
                <View
                  style={[
                    styles.categoryDot,
                    {backgroundColor: transaction.category?.color || theme.colors.primary},
                  ]}
                />
                <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                  {transaction.category?.name || 'Uncategorized'}
                </Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.detailRow}>
            <Icon
              name="calendar"
              size={20}
              color={theme.colors.textSecondary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                Date
              </Text>
              <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                {formatDateTime(transaction.date)}
              </Text>
            </View>
          </View>

          {transaction.notes && (
            <>
              <Divider />
              <View style={styles.detailRow}>
                <Icon
                  name="note-text"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>
                    Notes
                  </Text>
                  <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                    {transaction.notes}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {transaction.receipt && (
          <Card style={styles.receiptCard}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Receipt
            </Text>
            <Image
              source={{uri: transaction.receipt}}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </Card>
        )}

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
    paddingVertical: 32,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 16,
    marginTop: 8,
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
  receiptCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});