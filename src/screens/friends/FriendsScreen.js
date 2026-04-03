import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { contactsApi } from '../../api';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import SearchInput from '../../components/inputs/SearchInput';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';

const TABS = ['Friends', 'Requests', 'Contacts'];

// ─── helpers ────────────────────────────────────────────────────────────────
const normalizeFriend = (item) => {
  const person = item?.friend || item?.user || item;
  const id = person?.id ?? item?.friendId ?? item?.userId;
  const name =
    person?.name ||
    [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim() ||
    person?.email ||
    'Friend';
  return { id, name, email: person?.email || '', avatar: person?.avatar || null, balance: Number(item?.balance ?? person?.balance ?? 0) };
};

const normalizeContact = (item) => ({
  id: item?.id,
  name: item?.name || [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() || 'Contact',
  email: item?.email || '',
  phone: item?.phone || item?.phoneNumber || '',
  avatar: item?.avatar || null,
});

const extractList = (response, keys = []) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
    if (Array.isArray(root?.data?.[key])) return root.data[key];
  }
  if (Array.isArray(root?.data)) return root.data;
  return [];
};

const balanceColor = (b) => (b > 0 ? colors.success : b < 0 ? colors.error : colors.textSecondary);
const balanceLabel = (b) =>
  b < 0 ? `You owe $${Math.abs(b).toFixed(2)}` : b > 0 ? `Owes you $${b.toFixed(2)}` : 'Settled up';

// ─── main component ──────────────────────────────────────────────────────────
const FriendsScreen = ({ navigation }) => {
  const {
    friends, requests, isLoading,
    fetchFriends, fetchRequests,
    acceptFriendRequest, rejectFriendRequest,
    removeFriend, blockFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState('Friends');
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchFriends();
      fetchRequests();
    }, [])
  );

  const loadContacts = async () => {
    if (contactsLoaded) return;
    setContactsLoading(true);
    try {
      const res = await contactsApi.getAll();
      setContacts(extractList(res, ['contacts']));
      setContactsLoaded(true);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load contacts.');
    } finally {
      setContactsLoading(false);
    }
  };

  const onTabPress = (tab) => {
    setActiveTab(tab);
    setSearch('');
    if (tab === 'Contacts') loadContacts();
  };

  const onRefresh = async () => {
    if (activeTab === 'Contacts') {
      setContactsLoaded(false);
      await loadContacts();
    } else {
      await fetchFriends();
      await fetchRequests();
    }
  };

  // normalise
  const normalizedFriends = (friends || []).map(normalizeFriend).filter((f) => f.id);
  const normalizedContacts = (contacts || []).map(normalizeContact).filter((c) => c.id);

  const q = search.trim().toLowerCase();
  const filteredFriends = q
    ? normalizedFriends.filter((f) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q))
    : normalizedFriends;
  const filteredContacts = q
    ? normalizedContacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q))
    : normalizedContacts;
  const filteredRequests = (requests || []).filter((r) => {
    const name = r?.fromUser?.name || r?.fromUserName || '';
    return q ? name.toLowerCase().includes(q) : true;
  });

  // ── actions
  const handleAccept = async (id) => {
    setActionLoadingId(id);
    try {
      await acceptFriendRequest(id);
      await fetchFriends();
    } catch {
      Alert.alert('Error', 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      await rejectFriendRequest(id);
    } catch {
      Alert.alert('Error', 'Failed to reject request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = (friend) => {
    Alert.alert('Remove Friend', `Remove ${friend.name} from friends?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(friend.id);
          } catch {
            Alert.alert('Error', 'Failed to remove friend.');
          }
        },
      },
    ]);
  };

  const handleDeleteContact = (contact) => {
    Alert.alert('Delete Contact', `Delete ${contact.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactsApi.remove(contact.id);
            setContacts((prev) => prev.filter((c) => c.id !== contact.id));
          } catch {
            Alert.alert('Error', 'Failed to delete contact.');
          }
        },
      },
    ]);
  };

  // ── render helpers
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
          onPress={() => onTabPress(tab)}
        >
          <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
            {tab}
          </Text>
          {tab === 'Requests' && filteredRequests.length > 0 && activeTab !== 'Requests' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filteredRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const FriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FriendProfile', { friendId: item.id })}
      onLongPress={() =>
        Alert.alert(item.name, 'What would you like to do?', [
          { text: 'Remove Friend', style: 'destructive', onPress: () => handleRemoveFriend(item) },
          { text: 'Cancel', style: 'cancel' },
        ])
      }
    >
      <Avatar source={item.avatar} name={item.name} size={50} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.email}</Text>
      </View>
      <View style={styles.balanceChip}>
        <Text style={[styles.balanceText, { color: balanceColor(item.balance) }]}>
          {balanceLabel(item.balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const RequestItem = ({ item }) => {
    const fromUser = item?.fromUser || {};
    const name = fromUser?.name || fromUser?.firstName || item?.fromUserName || 'User';
    const email = fromUser?.email || item?.fromUserEmail || '';
    const avatar = fromUser?.avatar || null;
    const isProcessing = actionLoadingId === item.id;
    return (
      <View style={styles.card}>
        <Avatar source={avatar} name={name} size={50} />
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{name}</Text>
          <Text style={styles.cardSub}>{email}</Text>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleAccept(item.id)}
              disabled={isProcessing}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item.id)}
              disabled={isProcessing}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ContactDetail', { contact: item, onDelete: () => setContacts((p) => p.filter((c) => c.id !== item.id)), onUpdate: (updated) => setContacts((p) => p.map((c) => (c.id === updated.id ? updated : c))) })}
      onLongPress={() =>
        Alert.alert(item.name, 'What would you like to do?', [
          {
            text: 'Edit',
            onPress: () =>
              navigation.navigate('ContactDetail', {
                contact: item,
                onDelete: () => setContacts((p) => p.filter((c) => c.id !== item.id)),
                onUpdate: (updated) => setContacts((p) => p.map((c) => (c.id === updated.id ? updated : c))),
              }),
          },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteContact(item) },
          { text: 'Cancel', style: 'cancel' },
        ])
      }
    >
      <Avatar source={item.avatar} name={item.name} size={50} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.email || item.phone || 'No contact info'}</Text>
      </View>
      <View style={styles.contactTypeChip}>
        <Icon name="account-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.contactTypeText}>Contact</Text>
      </View>
    </TouchableOpacity>
  );

  const loading = isLoading || contactsLoading;
  const currentData = activeTab === 'Friends' ? filteredFriends : activeTab === 'Requests' ? filteredRequests : filteredContacts;

  const renderEmpty = () => {
    if (loading) return null;
    const map = {
      Friends: { icon: 'account-multiple-outline', title: 'No Friends Yet', msg: search ? 'No friends match your search.' : "Start by adding a friend.", action: 'Add Friend' },
      Requests: { icon: 'account-clock-outline', title: 'No Requests', msg: "You don't have pending friend requests.", action: null },
      Contacts: { icon: 'contacts-outline', title: 'No Contacts', msg: search ? 'No contacts match your search.' : 'Add contacts who are not on the app yet.', action: 'Add Contact' },
    };
    const cfg = map[activeTab];
    return (
      <EmptyState
        icon={cfg.icon}
        title={cfg.title}
        message={cfg.msg}
        actionTitle={cfg.action}
        onActionPress={cfg.action ? () => navigation.navigate('AddFriendOrContact') : undefined}
      />
    );
  };

  const totalFriends = normalizedFriends.length;
  const totalContacts = normalizedContacts.length;
  const pendingCount = (requests || []).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends & Contacts</Text>
        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => navigation.navigate('AddFriendOrContact')}
        >
          <Icon name="account-plus-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalFriends}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Requests</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalContacts}</Text>
          <Text style={styles.statLabel}>Contacts</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${activeTab.toLowerCase()}...`}
        />
      </View>

      {/* Tabs */}
      {renderTabBar()}

      {/* List */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) =>
          activeTab === 'Friends' ? (
            <FriendItem item={item} />
          ) : activeTab === 'Requests' ? (
            <RequestItem item={item} />
          ) : (
            <ContactItem item={item} />
          )
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddFriendOrContact')}
      >
        <Icon name="account-plus" size={28} color={colors.white} />
      </TouchableOpacity>

      <LoadingOverlay visible={loading && currentData.length === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#EAF0F8', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  addIconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#EAF8FC', justifyContent: 'center', alignItems: 'center',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: '#E5EAF2', marginVertical: 4 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: '#fff' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 28,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabBtnText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  tabBtnTextActive: { color: colors.primary },
  badge: {
    marginLeft: 6, backgroundColor: colors.primary,
    borderRadius: 10, minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  balanceChip: { alignItems: 'flex-end' },
  balanceText: { fontSize: 11, fontWeight: '700' },
  contactTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  contactTypeText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  requestActions: { flexDirection: 'row', marginTop: 8, gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  acceptBtn: { backgroundColor: colors.primary },
  rejectBtn: { backgroundColor: '#F1F5FB', borderWidth: 1, borderColor: '#DAE3F0' },
  acceptText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rejectText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
});

export default FriendsScreen;
