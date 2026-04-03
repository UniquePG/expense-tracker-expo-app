import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { contactsApi } from '../../api';
import Button from '../../components/buttons/Button';
import SearchInput from '../../components/inputs/SearchInput';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../hooks/useGroups';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatCurrency';

const SOURCE = {
  FRIEND: 'friend',
  CONTACT: 'contact',
};

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

const mapFriend = (item) => {
  const person = item?.friend || item?.user || item;
  if (!person?.id) return null;
  return {
    key: `${SOURCE.FRIEND}:${person.id}`,
    id: person.id,
    type: SOURCE.FRIEND,
    name:
      person.name ||
      [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
      person.email ||
      'Friend',
    subtitle: person.email || 'Friend',
    avatar: person.avatar || null,
  };
};

const mapContact = (item) => {
  if (!item?.id) return null;
  return {
    key: `${SOURCE.CONTACT}:${item.id}`,
    id: item.id,
    type: SOURCE.CONTACT,
    name: item?.name || [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() || 'Contact',
    subtitle: item?.email || item?.phoneNumber || item?.phone || 'Contact',
    avatar: item?.avatar || null,
  };
};

const GroupMembersScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const authUserId = useAuthStore((state) => state.user?.id);
  const [addingMembers, setAddingMembers] = useState(false);
  const [sourceTab, setSourceTab] = useState(SOURCE.FRIEND);
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const { friends, fetchFriends } = useFriends();
  const {
    groupDetails,
    groupMembers,
    groupBalances,
    isLoading,
    isActionLoading,
    getGroupDetails,
    fetchGroupMembers,
    fetchGroupBalances,
    addGroupMembers,
    removeGroupMember,
  } = useGroups();

  const members = groupMembers?.length ? groupMembers : groupDetails?.members || [];

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await Promise.all([
          getGroupDetails(groupId),
          fetchGroupMembers(groupId),
          fetchGroupBalances(groupId),
        ]);
      };
      load().catch(() => Alert.alert('Error', 'Unable to load group members.'));
    }, [fetchGroupBalances, fetchGroupMembers, getGroupDetails, groupId])
  );

  const currentMember = useMemo(
    () => members.find((member) => member.userId === authUserId || member.id === authUserId),
    [authUserId, members]
  );
  const isAdmin = Boolean(currentMember?.isAdmin || groupDetails?.isAdmin);

  const admins = members.filter((member) => member.isAdmin);
  const regularMembers = members.filter((member) => !member.isAdmin);

  const balanceByMemberId = useMemo(() => {
    const map = new Map();
    (groupBalances || []).forEach((item) => {
      if (item.memberId) map.set(item.memberId, item.balance);
      if (item.userId) map.set(item.userId, item.balance);
      if (item.contactId) map.set(item.contactId, item.balance);
    });
    return map;
  }, [groupBalances]);

  const friendCandidates = useMemo(
    () => (friends || []).map(mapFriend).filter(Boolean),
    [friends]
  );

  const contactCandidates = useMemo(
    () => (contacts || []).map(mapContact).filter(Boolean),
    [contacts]
  );

  const membersLookup = useMemo(() => {
    const set = new Set();
    members.forEach((member) => {
      if (member.userId) set.add(`${SOURCE.FRIEND}:${member.userId}`);
      if (member.contactId) set.add(`${SOURCE.CONTACT}:${member.contactId}`);
      set.add(`${SOURCE.FRIEND}:${member.id}`);
      set.add(`${SOURCE.CONTACT}:${member.id}`);
    });
    return set;
  }, [members]);

  const visibleCandidates = useMemo(() => {
    const baseList = sourceTab === SOURCE.FRIEND ? friendCandidates : contactCandidates;
    const filtered = baseList.filter((candidate) => !membersLookup.has(candidate.key));
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((candidate) => candidate.name.toLowerCase().includes(query));
  }, [contactCandidates, friendCandidates, membersLookup, search, sourceTab]);

  const loadContacts = async () => {
    if (contactsLoaded) return;
    try {
      const response = await contactsApi.getAll();
      setContacts(extractList(response, ['contacts']));
      setContactsLoaded(true);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load contacts.');
    }
  };

  const toggleCandidate = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleConfirmAddMembers = async () => {
    if (!selectedKeys.length) {
      Alert.alert('Add Members', 'Select at least one member.');
      return;
    }

    const payloads = selectedKeys.map((key) => {
      const [type, id] = key.split(':');
      return type === SOURCE.CONTACT ? { contactId: id } : { userId: id };
    });

    try {
      await addGroupMembers(groupId, payloads);
      setSelectedKeys([]);
      setAddingMembers(false);
      await Promise.all([fetchGroupMembers(groupId), fetchGroupBalances(groupId)]);
      Alert.alert('Success', 'Members added successfully.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to add members.');
    }
  };

  const handleRemoveMember = (member) => {
    const name = member.name || 'this member';
    Alert.alert(
      'Remove Member',
      `Remove ${name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const identity = member.userId || member.contactId || member.id;
              await removeGroupMember(groupId, identity);
              await Promise.all([fetchGroupMembers(groupId), fetchGroupBalances(groupId)]);
            } catch (error) {
              Alert.alert('Error', error?.message || 'Unable to remove member.');
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }) => {
    const balance = Number(
      balanceByMemberId.get(item.memberId || item.id) ??
        balanceByMemberId.get(item.userId) ??
        balanceByMemberId.get(item.contactId) ??
        0
    );
    const balanceColor =
      balance > 0 ? colors.success : balance < 0 ? colors.error : colors.textSecondary;
    const canRemove = isAdmin && item.userId !== authUserId;

    return (
      <TouchableOpacity
        style={styles.memberCard}
        activeOpacity={0.88}
        onPress={() => {
          if (item.userId) {
            navigation.navigate('FriendProfile', { friendId: item.userId });
          }
        }}
      >
        <Avatar source={item.avatar} name={item.name} size={44} />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            {item.isAdmin && <Icon name="crown" size={14} color="#D97706" />}
          </View>
          <Text style={styles.memberMeta}>
            Joined {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : 'recently'}
          </Text>
        </View>
        <View style={styles.memberRight}>
          <Text style={[styles.balanceLabel, { color: balanceColor }]}>
            {balance > 0 ? 'Gets' : balance < 0 ? 'Owes' : 'Settled'}
          </Text>
          <Text style={[styles.balanceValue, { color: balanceColor }]}>
            {formatCurrency(Math.abs(balance))}
          </Text>
        </View>
        {canRemove && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveMember(item)}>
            <Icon name="trash-can-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderMembersSection = (label, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      {data.length ? (
        data.map((member) => <View key={String(member.id)}>{renderMember({ item: member })}</View>)
      ) : (
        <Text style={styles.emptySectionText}>No members in this section.</Text>
      )}
    </View>
  );

  const renderCandidate = ({ item }) => {
    const selected = selectedKeys.includes(item.key);
    return (
      <TouchableOpacity style={styles.candidateRow} onPress={() => toggleCandidate(item.key)}>
        <Avatar source={item.avatar} name={item.name} size={40} />
        <View style={styles.candidateText}>
          <Text style={styles.candidateName}>{item.name}</Text>
          <Text style={styles.candidateSubtitle}>{item.subtitle}</Text>
        </View>
        <Icon
          name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper backgroundColor="#F4F7FB">
      <Header
        title={`Members (${members.length})`}
        showBack
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={async () => {
              setAddingMembers((prev) => !prev);
              if (!addingMembers) {
                await fetchFriends();
              }
            }}
          >
            <Icon name={addingMembers ? 'close' : 'account-plus'} size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {addingMembers && (
          <View style={styles.addPanel}>
            <Text style={styles.panelTitle}>Add Members</Text>
            <View style={styles.sourceTabs}>
              <TouchableOpacity
                style={[styles.sourceTab, sourceTab === SOURCE.FRIEND && styles.sourceTabActive]}
                onPress={() => setSourceTab(SOURCE.FRIEND)}
              >
                <Text
                  style={[
                    styles.sourceTabText,
                    sourceTab === SOURCE.FRIEND && styles.sourceTabTextActive,
                  ]}
                >
                  Friends
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sourceTab, sourceTab === SOURCE.CONTACT && styles.sourceTabActive]}
                onPress={async () => {
                  setSourceTab(SOURCE.CONTACT);
                  await loadContacts();
                }}
              >
                <Text
                  style={[
                    styles.sourceTabText,
                    sourceTab === SOURCE.CONTACT && styles.sourceTabTextActive,
                  ]}
                >
                  Contacts
                </Text>
              </TouchableOpacity>
            </View>

            <SearchInput value={search} onChangeText={setSearch} placeholder="Search members" />
            <FlatList
              data={visibleCandidates}
              keyExtractor={(item) => item.key}
              renderItem={renderCandidate}
              style={styles.candidatesList}
              ListEmptyComponent={
                <Text style={styles.emptySectionText}>No available members to add.</Text>
              }
            />

            <Button
              title={`Add Selected (${selectedKeys.length})`}
              onPress={handleConfirmAddMembers}
              disabled={!selectedKeys.length}
            />
          </View>
        )}

        {members.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="No members"
            message="Start by adding members to split expenses in this group."
          />
        ) : (
          <View>
            {renderMembersSection('Admins', admins)}
            {renderMembersSection('Members', regularMembers)}
          </View>
        )}
      </ScrollView>

      <LoadingOverlay visible={isLoading || isActionLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  addPanel: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    padding: 12,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  sourceTabs: {
    flexDirection: 'row',
    backgroundColor: '#E8EFF7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  sourceTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sourceTabActive: {
    backgroundColor: colors.white,
  },
  sourceTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  sourceTabTextActive: {
    color: colors.primary,
  },
  candidatesList: {
    maxHeight: 230,
    marginTop: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF1F7',
  },
  candidateText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  candidateSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F8',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  memberMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  memberRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FEEDEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySectionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 10,
  },
});

export default GroupMembersScreen;
