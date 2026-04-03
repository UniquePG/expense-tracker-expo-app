import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import SearchInput from '../../components/ui/SearchInput';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';
;

const FriendsScreen = ({ navigation }) => {
  const { friends, requests, isLoading, fetchFriends, fetchRequests } = useFriends();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Friends');

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const onRefresh = () => {
    fetchFriends();
    fetchRequests();
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  const FriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => navigation.navigate('FriendProfile', { friendId: item.id })}
    >
      <Avatar source={item.avatar} name={item.name} size={56} radius={28} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={[
          styles.friendStatus, 
          { color: item.balance < 0 ? colors.error : item.balance > 0 ? colors.success : colors.textSecondary }
        ]}>
          {item.balance < 0 ? `You owe $${Math.abs(item.balance).toFixed(2)}` : 
           item.balance > 0 ? `Owes you $${item.balance.toFixed(2)}` : 
           'Settled up'}
        </Text>
      </View>
      <TouchableOpacity style={styles.msgBtn}>
        <Icon name="message-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const RequestItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Avatar source={item.fromUser?.avatar} name={item.fromUser?.name} size={56} radius={28} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.fromUser?.name}</Text>
        <Text style={styles.friendStatus}>Sent you a friend request</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.navigate('FriendRequests')}>
          <Icon name="check" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddFriend')}>
          <Icon name="account-plus-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput 
          placeholder="Search friends" 
          value={search} 
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Friends' && styles.activeTab]} 
          onPress={() => setActiveTab('Friends')}
        >
          <Text style={[styles.tabText, activeTab === 'Friends' && styles.activeTabText]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Requests' && styles.activeTab]} 
          onPress={() => setActiveTab('Requests')}
        >
          <Text style={[styles.tabText, activeTab === 'Requests' && styles.activeTabText]}>Requests</Text>
          {requests.length > 0 && (
            <Badge content={requests.length} color={colors.primary} style={styles.badge} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {activeTab === 'Friends' ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map(item => <FriendItem key={item.id} item={item} />)
          ) : (
            !isLoading && (
              <EmptyState
                icon="account-multiple"
                title="No Friends Found"
                message={search ? "No friends match your search." : "You haven't added any friends yet."}
                actionTitle={search ? null : "Add Friend"}
                onActionPress={() => navigation.navigate('AddFriend')}
              />
            )
          )
        ) : (
          requests.length > 0 ? (
            requests.map(item => <RequestItem key={item.id} item={item} />)
          ) : (
            !isLoading && (
              <EmptyState
                icon="account-clock"
                title="No Pending Requests"
                message="You don't have any pending friend requests."
              />
            )
          )
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddFriend')}>
        <Icon name="account-plus" size={30} color={colors.white} />
      </TouchableOpacity>
      <LoadingOverlay visible={isLoading} />
    </View>
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginRight: 32,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  badge: {
    marginLeft: 8,
  },
  content: {
    padding: 24,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  friendStatus: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  msgBtn: {
    padding: 8,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default FriendsScreen;
