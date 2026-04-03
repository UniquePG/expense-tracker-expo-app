import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';
import { formatCurrency } from '../../utils/formatCurrency';
;

const FriendProfileScreen = ({ route, navigation }) => {
  const { friendId } = route.params;
  const { getFriendDetails, friendDetails, removeFriend, isLoading } = useFriends();

  useEffect(() => {
    getFriendDetails(friendId);
  }, [friendId]);

  const handleRemoveFriend = () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendDetails?.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friendId);
              Alert.alert('Success', 'Friend removed');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          }
        },
      ]
    );
  };

  if (!friendDetails && !isLoading) return null;

  return (
    <ScreenWrapper>
      <Header title="Friend Profile" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar source={friendDetails?.avatar} name={friendDetails?.name} size={100} radius={50} />
          <Text style={styles.name}>{friendDetails?.name}</Text>
          <Text style={styles.email}>{friendDetails?.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>You owe</Text>
            <Text style={[styles.statValue, { color: colors.error }]}>
              {formatCurrency(friendDetails?.balance < 0 ? Math.abs(friendDetails.balance) : 0)}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Owes you</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatCurrency(friendDetails?.balance > 0 ? friendDetails.balance : 0)}
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIONS</Text>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('SettleDebt', { friendId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="handshake" size={24} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Settle Up</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('AddExpense', { friendId })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
              <Icon name="plus-circle" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Expense</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.removeBtn]} onPress={handleRemoveFriend}>
            <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="account-remove" size={24} color={colors.error} />
            </View>
            <Text style={[styles.actionText, { color: colors.error }]}>Remove Friend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  removeBtn: {
    borderBottomWidth: 0,
    marginTop: 12,
  },
});

export default FriendProfileScreen;
