import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import { useSettlements } from '../../hooks/useSettlements';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import SelectField from '../../components/inputs/SelectField';
import CurrencyInput from '../../components/inputs/CurrencyInput';
import DatePickerField from '../../components/inputs/DatePickerField';
import InputField from '../../components/inputs/InputField';
import Button from '../../components/buttons/Button';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import Avatar from '../../components/ui/Avatar';

const SettleDebtScreen = ({ route, navigation }) => {
  const { friendId: initialFriendId } = route.params || {};
  const { friends, fetchFriends } = useFriends();
  const { createSettlement, isLoading: settlementLoading } = useSettlements();
  
  const [friendId, setFriendId] = useState(initialFriendId || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSettle = async () => {
    if (!friendId) {
      Alert.alert('Error', 'Please select a friend');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await createSettlement({
        toUserId: friendId,
        amount: parseFloat(amount),
        date: date.toISOString(),
        notes,
      });
      Alert.alert('Success', 'Settlement recorded successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to record settlement');
    }
  };

  const friendOptions = friends.map((f) => ({
    label: f.name,
    value: f.id,
    avatar: f.avatar,
  }));

  const selectedFriend = friends.find((f) => f.id === friendId);

  return (
    <ScreenWrapper>
      <Header title="Settle Up" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Record a Payment</Text>
          <Text style={styles.subtitle}>Keep track of payments you&apos;ve made to your friends.</Text>
        </View>

        <SelectField
          label="Select Friend"
          value={friendId}
          onValueChange={setFriendId}
          options={friendOptions}
          placeholder="Who did you pay?"
        />

        {selectedFriend && (
          <View style={styles.balanceInfo}>
            <Avatar source={selectedFriend.avatar} name={selectedFriend.name} size={40} radius={20} />
            <View style={styles.balanceText}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={[styles.balanceValue, { color: selectedFriend.balance >= 0 ? colors.success : colors.error }]}>
                {selectedFriend.balance >= 0 ? 'Owes you' : 'You owe'} ${Math.abs(selectedFriend.balance).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <CurrencyInput
          label="Amount Paid"
          value={amount}
          onChangeValue={setAmount}
          placeholder="0.00"
        />

        <DatePickerField
          label="Date of Payment"
          value={date}
          onChange={setDate}
        />

        <InputField
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="What was this for?"
          multiline
          numberOfLines={3}
        />

        <Button 
          title="Record Payment" 
          onPress={handleSettle} 
          loading={settlementLoading} 
          style={styles.button}
        />
      </ScrollView>
      <LoadingOverlay visible={settlementLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
  },
  balanceText: {
    marginLeft: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    marginTop: 24,
  },
});

export default SettleDebtScreen;
