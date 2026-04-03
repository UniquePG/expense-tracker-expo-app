import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { contactsApi } from '../../api';
import Button from '../../components/buttons/Button';
import SearchInput from '../../components/inputs/SearchInput';
import Avatar from '../../components/ui/Avatar';
import ImagePickerField from '../../components/ui/ImagePickerField';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../hooks/useGroups';
import InputField from '../../components/inputs/InputField';

const MEMBER_SOURCE = {
  FRIEND: 'friend',
  CONTACT: 'contact',
};

const normalizeFriend = (item) => {
  const person = item?.friend || item?.user || item;
  if (!person) return null;
  const id = person.id ?? item?.friendId ?? item?.userId;
  if (!id) return null;
  const name =
    person.name ||
    [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
    person.email ||
    'Friend';
  return {
    key: `${MEMBER_SOURCE.FRIEND}:${id}`,
    id,
    type: MEMBER_SOURCE.FRIEND,
    name,
    subtitle: person.email || 'Friend',
    avatar: person.avatar || null,
  };
};

const normalizeContact = (item) => {
  const id = item?.id;
  if (!id) return null;
  return {
    key: `${MEMBER_SOURCE.CONTACT}:${id}`,
    id,
    type: MEMBER_SOURCE.CONTACT,
    name: item?.name || [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() || 'Contact',
    subtitle: item?.email || item?.phoneNumber || item?.phone || 'Contact',
    avatar: item?.avatar || null,
  };
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

const CreateGroupScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState(MEMBER_SOURCE.FRIEND);
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: null,
    selectedMemberKeys: [],
  });

  const { friends, fetchFriends } = useFriends();
  const {
    createGroup,
    addGroupMembers,
    uploadGroupImage,
    isLoading,
    isActionLoading,
  } = useGroups();

  const loading = isLoading || isActionLoading;

  const friendOptions = useMemo(
    () => (friends || []).map(normalizeFriend).filter(Boolean),
    [friends]
  );

  const contactOptions = useMemo(
    () => (contacts || []).map(normalizeContact).filter(Boolean),
    [contacts]
  );

  const visibleMembers = useMemo(() => {
    const sourceList = activeSource === MEMBER_SOURCE.FRIEND ? friendOptions : contactOptions;
    const query = search.trim().toLowerCase();
    if (!query) return sourceList;
    return sourceList.filter((member) => member.name.toLowerCase().includes(query));
  }, [activeSource, contactOptions, friendOptions, search]);

  const selectedCount = form.selectedMemberKeys.length;

  const loadContactsIfNeeded = async () => {
    if (contactsLoaded) return;
    try {
      const response = await contactsApi.getAll();
      setContacts(extractList(response, ['contacts']));
      setContactsLoaded(true);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load contacts.');
    }
  };

  // When screen re-focuses (e.g. returning from AddFriendOrContact), reload friends & contacts
  useFocusEffect(
    useCallback(() => {
      if (step === 2) {
        fetchFriends();
        // Force contacts reload on next tab switch
        setContactsLoaded(false);
      }
    }, [step])
  );

  const handleNext = async () => {
    if (step === 1) {
      if (!form.name.trim()) {
        Alert.alert('Validation', 'Group name is required.');
        return;
      }
      setStep(2);
      await fetchFriends();
      return;
    }
  };

  const toggleMember = (memberKey) => {
    setForm((prev) => {
      const selected = prev.selectedMemberKeys.includes(memberKey);
      return {
        ...prev,
        selectedMemberKeys: selected
          ? prev.selectedMemberKeys.filter((key) => key !== memberKey)
          : [...prev.selectedMemberKeys, memberKey],
      };
    });
  };

  const handleCreate = async () => {
    try {
      const selectedFriends = form.selectedMemberKeys
        .filter((key) => key.startsWith(`${MEMBER_SOURCE.FRIEND}:`))
        .map((key) => key.split(':')[1]);
      const selectedContacts = form.selectedMemberKeys
        .filter((key) => key.startsWith(`${MEMBER_SOURCE.CONTACT}:`))
        .map((key) => key.split(':')[1]);

      const createdGroup = await createGroup({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        memberIds: selectedFriends,
      });

      if (!createdGroup?.id) {
        throw new Error('Group created but missing group id.');
      }

      if (selectedContacts.length) {
        await addGroupMembers(
          createdGroup.id,
          selectedContacts.map((contactId) => ({ contactId }))
        );
      }

      if (form.image?.uri) {
        await uploadGroupImage(createdGroup.id, form.image);
      }

      navigation.replace('GroupDetails', {
        groupId: createdGroup.id,
        title: createdGroup.name,
      });
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create group.');
    }
  };

  const renderStepHeader = () => (
    <View style={styles.stepHeader}>
      <View style={[styles.stepPill, step === 1 && styles.stepPillActive]}>
        <Text style={[styles.stepPillText, step === 1 && styles.stepPillTextActive]}>1. Info</Text>
      </View>
      <View style={styles.stepDivider} />
      <View style={[styles.stepPill, step === 2 && styles.stepPillActive]}>
        <Text style={[styles.stepPillText, step === 2 && styles.stepPillTextActive]}>
          2. Members
        </Text>
      </View>
    </View>
  );

  const renderStepOne = () => (
    <View style={styles.stepBody}>
      <Text style={styles.sectionTitle}>Group Info</Text>
      <Text style={styles.sectionSubTitle}>Set a name, optional description and group photo.</Text>

      <ImagePickerField
        label="Group Image (Optional)"
        value={form.image}
        onChange={(image) => setForm((prev) => ({ ...prev, image }))}
      />

      <InputField
        label="Group Name"
        value={form.name}
        onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
        placeholder="e.g. Goa Trip 2026"
      />

      <InputField
        label="Description (Optional)"
        value={form.description}
        onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
        placeholder="What's this group for?"
        multiline
        numberOfLines={4}
      />

      <Button title="Next" onPress={handleNext} style={styles.primaryButton} />
    </View>
  );

  const renderMemberItem = ({ item }) => {
    const selected = form.selectedMemberKeys.includes(item.key);
    return (
      <TouchableOpacity style={styles.memberRow} onPress={() => toggleMember(item.key)}>
        <Avatar source={item.avatar} name={item.name} size={42} />
        <View style={styles.memberTextWrap}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberSubtitle}>{item.subtitle}</Text>
        </View>
        <Icon
          name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderStepTwo = () => (
    <View style={styles.stepBody}>
      <Text style={styles.sectionTitle}>Add Members</Text>
      <Text style={styles.sectionSubTitle}>Select friends and contacts to include in the group.</Text>

      <View style={styles.sourceTabs}>
        <TouchableOpacity
          style={[styles.sourceTab, activeSource === MEMBER_SOURCE.FRIEND && styles.sourceTabActive]}
          onPress={() => setActiveSource(MEMBER_SOURCE.FRIEND)}
        >
          <Text
            style={[
              styles.sourceTabText,
              activeSource === MEMBER_SOURCE.FRIEND && styles.sourceTabTextActive,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sourceTab, activeSource === MEMBER_SOURCE.CONTACT && styles.sourceTabActive]}
          onPress={async () => {
            setActiveSource(MEMBER_SOURCE.CONTACT);
            await loadContactsIfNeeded();
          }}
        >
          <Text
            style={[
              styles.sourceTabText,
              activeSource === MEMBER_SOURCE.CONTACT && styles.sourceTabTextActive,
            ]}
          >
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      <SearchInput value={search} onChangeText={setSearch} placeholder="Search members" />

      {/* Quick add shortcut */}
      <TouchableOpacity
        style={styles.addNewLink}
        onPress={() => navigation.navigate('AddFriendOrContact', { returnTo: 'CreateGroup' })}
      >
        <Icon name="account-plus-outline" size={16} color={colors.primary} />
        <Text style={styles.addNewLinkText}>Add New Friend or Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={visibleMembers}
        keyExtractor={(item) => item.key}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.memberList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeSource === MEMBER_SOURCE.FRIEND
              ? 'No friends found. Tap above to add a friend.'
              : 'No contacts found. Tap above to add a contact.'}
          </Text>
        }
      />

      <View style={styles.actionsRow}>
        <Button title="Back" mode="outlined" onPress={() => setStep(1)} style={styles.actionButton} />
        <Button
          title={`Create Group (${selectedCount})`}
          onPress={handleCreate}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper backgroundColor="#F5F8FC">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.headerIconButton} />
      </View>

      {renderStepHeader()}
      {step === 1 ? renderStepOne() : renderStepTwo()}

      <LoadingOverlay visible={loading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#E7EEF6',
  },
  stepPillActive: {
    backgroundColor: colors.primary,
  },
  stepPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  stepPillTextActive: {
    color: colors.white,
  },
  stepDivider: {
    width: 28,
    height: 1,
    backgroundColor: '#BFCBDA',
    marginHorizontal: 8,
  },
  stepBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  sectionSubTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
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
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  sourceTabActive: {
    backgroundColor: colors.white,
  },
  sourceTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  sourceTabTextActive: {
    color: colors.primary,
  },
  memberList: {
    paddingTop: 10,
    paddingBottom: 16,
    flexGrow: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  memberTextWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  memberSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textSecondary,
    fontSize: 13,
  },
  addNewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  addNewLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default CreateGroupScreen;
