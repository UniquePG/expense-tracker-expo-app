import { formatCurrency } from '@/utils/formatCurrency';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FloatingActionButton } from '../../components/buttons/FloatingActionButton';
import { FriendCard } from '../../components/cards/FriendCard';
import { SearchInput } from '../../components/inputs/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useDebounce } from '../../hooks/useDebounce';
import { useFriends } from '../../hooks/useFriends';

export const FriendsListScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const {
    friends,
    friendRequests,
    balances,
    isLoading,
    refresh,
    removeFriend,
  } = useFriends({autoFetch: true});

  const filteredFriends = friends.filter(friend => {
    const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    const email = friend.email.toLowerCase();
    const query = debouncedSearch.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleRemoveFriend = useCallback((friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.firstName} ${friend.lastName} from your friends?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriend(friend.id),
        },
      ]
    );
  }, [removeFriend]);

  const getFriendBalance = (friendId) => {
    return balances.find(b => b.friendId === friendId);
  };

  const renderFriendItem = ({item}) => (
    <FriendCard
      friend={item}
      balance={getFriendBalance(item.id)}
      onPress={() => navigation.navigate('FriendProfile', {id: item.id})}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="account-off"
      title="No friends yet"
      message="Add friends to start splitting expenses"
      actionLabel="Add Friend"
      onAction={() => navigation.navigate('AddFriend')}
    />
  );

  const pendingRequestsCount = friendRequests.filter(r => r.status === 'pending').length;

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Friends"
        subtitle={`${friends.length} friends`}
        rightIcon="account-plus"
        onRightPress={() => navigation.navigate('AddFriend')}
      />

      <View style={styles.container}>
        {pendingRequestsCount > 0 && (
          <TouchableOpacity
            style={[styles.requestsBanner, {backgroundColor: theme.colors.primaryLight}]}
            onPress={() => navigation.navigate('FriendRequests')}>
            <View style={styles.requestsContent}>
              <Icon name="account-clock" size={24} color={theme.colors.primary} />
              <Text style={[styles.requestsText, {color: theme.colors.text}]}>
                {pendingRequestsCount} pending friend request{pendingRequestsCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search friends..."
          style={styles.searchInput}
        />

        <View style={styles.balanceSummary}>
          <Text style={[styles.balanceTitle, {color: theme.colors.text}]}>
            Balance Summary
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceLabel, {color: theme.colors.textSecondary}]}>
                You owe
              </Text>
              <Text style={[styles.balanceAmount, {color: theme.colors.expense}]}>
                {formatCurrency(balances.filter(b => b.amount < 0).reduce((sum, b) => sum + Math.abs(b.amount), 0))}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceLabel, {color: theme.colors.textSecondary}]}>
                You are owed
              </Text>
              <Text style={[styles.balanceAmount, {color: theme.colors.income}]}>
                {formatCurrency(balances.filter(b => b.amount > 0).reduce((sum, b) => sum + b.amount, 0))}
              </Text>
            </View>
          </View>
        </View>

        {filteredFriends.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriendItem}
            contentContainerStyle={styles.listContent}
            onRefresh={refresh}
            refreshing={isLoading}
          />
        )}
      </View>

      <FloatingActionButton
        onPress={() => navigation.navigate('AddFriend')}
        style={styles.fab}
      />

      <LoadingOverlay visible={isLoading && friends.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  requestsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  requestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestsText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  balanceSummary: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: 'transparent',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});