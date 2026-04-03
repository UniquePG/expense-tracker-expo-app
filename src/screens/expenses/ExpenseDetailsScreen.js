import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { expensesApi, settlementsApi } from '../../api';
import Avatar from '../../components/ui/Avatar';
import { ImagePickerField } from '../../components/ui/ImagePickerField';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatCurrency';
import storage from '../../utils/storage';
;

const asExpense = (response) =>
  response?.data?.expense || response?.expense || response?.data || response || null;

const asComments = (response) => {
  if (Array.isArray(response?.data?.comments)) return response.data.comments;
  if (Array.isArray(response?.comments)) return response.comments;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const displayName = (person) =>
  person?.fullName ||
  [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim() ||
  person?.name ||
  'Unknown';

const ExpenseDetailsScreen = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const authUser = useAuthStore((state) => state.user);

  const [me, setMe] = useState(authUser || null);
  const [expense, setExpense] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      if (authUser?.id) return;
      const storedUser = await storage.getUserData();
      setMe(storedUser || null);
    };
    loadMe();
  }, [authUser]);

  const loadExpense = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getById(expenseId);
      const data = asExpense(response);
      setExpense(data);
      if (Array.isArray(data?.comments) && data.comments.length) {
        setComments(data.comments);
      }
    } catch {
      Alert.alert('Error', 'Failed to load expense details.');
    } finally {
      setIsLoading(false);
    }
  }, [expenseId]);

  const loadComments = useCallback(async () => {
    try {
      const response = await expensesApi.getComments(expenseId);
      setComments(asComments(response));
    } catch {
      // keep existing comments if comments API fails
    }
  }, [expenseId]);

  useFocusEffect(
    useCallback(() => {
      loadExpense();
      loadComments();
    }, [loadExpense, loadComments])
  );

  const isPayer = useMemo(
    () => !!expense?.paidBy?.id && !!me?.id && expense.paidBy.id === me.id,
    [expense?.paidBy?.id, me?.id]
  );

  const splits = expense?.splits || [];
  const mySplit = useMemo(
    () =>
      splits.find((split) => split?.user?.id === me?.id) ||
      splits.find((split) => split?.userId === me?.id),
    [splits, me?.id]
  );
  const remindableSplits = useMemo(
    () =>
      splits.filter(
        (split) =>
          !split?.isSettled &&
          split?.user?.id &&
          split.user.id !== me?.id &&
          split.user.id !== expense?.paidBy?.id
      ),
    [splits, me?.id, expense?.paidBy?.id]
  );

  const onDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsBusy(true);
          try {
            await expensesApi.delete(expenseId);
            Alert.alert('Deleted', 'Expense removed.');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to delete expense.');
          } finally {
            setIsBusy(false);
          }
        },
      },
    ]);
  };

  const onUploadReceipt = async (file) => {
    if (!file?.uri) return;
    const formData = new FormData();
    formData.append('receipt', {
      uri: file.uri,
      name: file.fileName || `receipt_${Date.now()}.jpg`,
      type: file.type || 'image/jpeg',
    });

    setIsBusy(true);
    try {
      await expensesApi.uploadReceipt(expenseId, formData);
      await loadExpense();
      Alert.alert('Receipt Uploaded', 'Receipt was added successfully.');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to upload receipt.');
    } finally {
      setIsBusy(false);
    }
  };

  const onAddComment = async () => {
    const text = commentInput.trim();
    if (!text) return;
    if (text.length > 500) {
      Alert.alert('Too Long', 'Comment must be 500 characters or fewer.');
      return;
    }

    const optimistic = {
      id: `temp-${Date.now()}`,
      text,
      user: me,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setComments((prev) => [...prev, optimistic]);
    setCommentInput('');

    try {
      await expensesApi.addComment(expenseId, text);
      await loadComments();
    } catch (error) {
      setComments((prev) => prev.filter((comment) => comment.id !== optimistic.id));
      Alert.alert('Error', error?.response?.data?.message || 'Failed to post comment.');
    }
  };

  const onRemindAll = async () => {
    if (!remindableSplits.length) return;

    setIsBusy(true);
    try {
      for (const split of remindableSplits) {
        await settlementsApi.remind(expenseId, {
          toUserId: split.user.id,
          amount: num(split.amount),
        });
      }
      const names = remindableSplits.map((split) => displayName(split.user)).join(', ');
      Alert.alert('Reminder Sent', `Reminder sent to ${names}.`);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send reminders.');
    } finally {
      setIsBusy(false);
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
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {expense.description}
        </Text>
        <View style={styles.headerActions}>
          {isPayer && (
            <TouchableOpacity
              onPress={() => navigation.navigate('SplitWizard', { expenseId })}
              style={styles.iconBtn}
            >
              <Icon name="tune-variant" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          {isPayer && (
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
              <Icon name="trash-can-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isBusy && <ActivityIndicator color={colors.primary} style={{ marginTop: 6 }} />}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.amount}>{formatCurrency(num(expense.amount), expense.currency || 'INR')}</Text>
          <Text style={styles.heroMeta}>
            {expense.category?.name || 'Uncategorized'} | Paid by {displayName(expense.paidBy)}
          </Text>
          <Text style={styles.heroMeta}>
            {new Date(expense.expenseDate || expense.date || expense.createdAt).toDateString()} | {expense.splitType}
          </Text>
        </View>

        {expense?.image ? (
          <View style={styles.card}>
            <Image source={{ uri: expense.image }} style={styles.receiptImage} />
            {isPayer && (
              <ImagePickerField
                label="Replace Receipt"
                value={null}
                onChange={onUploadReceipt}
              />
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <ImagePickerField label="Add Receipt" value={null} onChange={onUploadReceipt} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Who Owes What</Text>
          {splits.map((split) => {
            const person = split.user || split.contact || {};
            const name = displayName(person);
            const isMyUnsettled = split.user?.id === me?.id && !split.isSettled;
            return (
              <View key={split.id || `${name}-${split.amount}`} style={styles.splitRow}>
                <View style={styles.left}>
                  <Avatar source={person.avatar} name={name} size={34} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={[styles.status, { color: split.isSettled ? colors.success : colors.error }]}>
                      {split.isSettled ? 'Settled' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amountSmall}>{formatCurrency(num(split.amount), expense.currency || 'INR')}</Text>
                  {isMyUnsettled && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('SettleDebt', {
                          toUserId: expense?.paidBy?.id,
                          amount: num(split.amount),
                        })
                      }
                    >
                      <Text style={styles.link}>Settle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          {!!mySplit && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                Your share: {formatCurrency(num(mySplit.amount), expense.currency || 'INR')} |{' '}
                {mySplit.isSettled ? 'Settled' : 'You owe'}
              </Text>
            </View>
          )}
        </View>

        {isPayer && remindableSplits.length > 0 && (
          <TouchableOpacity style={styles.remindBtn} onPress={onRemindAll}>
            <Text style={styles.remindBtnText}>Remind All</Text>
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Comments</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <Avatar source={comment?.user?.avatar} name={displayName(comment?.user)} size={30} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.commentName}>{displayName(comment?.user)}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
          <View style={styles.commentInputWrap}>
            <TextInput
              style={styles.commentInput}
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Add a comment..."
              maxLength={500}
            />
            <TouchableOpacity onPress={onAddComment}>
              <Icon name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const num = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  },
  headerTitle: { flex: 1, marginHorizontal: 10, fontSize: 16, fontWeight: '700', color: colors.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  content: { padding: 14, paddingBottom: 24 },
  hero: { backgroundColor: '#F2FAFD', borderRadius: 14, padding: 14, marginBottom: 12 },
  amount: { fontSize: 30, fontWeight: '800', color: colors.text },
  heroMeta: { marginTop: 4, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  receiptImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 8 },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: colors.text },
  status: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  amountSmall: { fontSize: 13, fontWeight: '700', color: colors.text },
  link: { marginTop: 3, color: colors.primary, fontSize: 12, fontWeight: '700' },
  summaryBox: { marginTop: 8, backgroundColor: '#EAF7FF', borderRadius: 10, padding: 10 },
  summaryText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  remindBtn: {
    height: 44,
    backgroundColor: '#F7EBF2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  remindBtnText: { color: '#A3346E', fontWeight: '700' },
  commentRow: { flexDirection: 'row', marginBottom: 10 },
  commentName: { fontSize: 12, fontWeight: '700', color: colors.text },
  commentText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  commentInputWrap: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentInput: { flex: 1, color: colors.text, marginRight: 8 },
});

export default ExpenseDetailsScreen;
