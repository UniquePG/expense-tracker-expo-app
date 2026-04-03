import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import Avatar from '../../components/ui/Avatar';
import Header from '../../components/ui/Header';
import ImagePickerField from '../../components/ui/ImagePickerField';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
import { useAuthStore } from '../../store/authStore';

const GROUP_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

const GroupSettingsScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const authUserId = useAuthStore((state) => state.user?.id);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: GROUP_STATUS.ACTIVE,
    image: null,
  });
  const [imageUpdated, setImageUpdated] = useState(false);

  const {
    groupDetails,
    isLoading,
    isActionLoading,
    getGroupDetails,
    updateGroup,
    uploadGroupImage,
    deleteGroupImage,
    archiveGroup,
    leaveGroup,
    deleteGroup,
  } = useGroups();

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const details = await getGroupDetails(groupId);
        if (details) {
          setForm({
            name: details.name || '',
            description: details.description || '',
            status: details.status || GROUP_STATUS.ACTIVE,
            image: details.image
              ? {
                  uri: details.image,
                  type: 'image/jpeg',
                  fileName: `group_${details.id || Date.now()}.jpg`,
                }
              : null,
          });
          setImageUpdated(false);
        }
      };
      load().catch(() => Alert.alert('Error', 'Unable to load group settings.'));
    }, [getGroupDetails, groupId])
  );

  const members = groupDetails?.members || [];
  const currentMember = members.find((member) => member.userId === authUserId || member.id === authUserId);
  const isAdmin = Boolean(currentMember?.isAdmin || groupDetails?.isAdmin);

  const isArchived = form.status === GROUP_STATUS.ARCHIVED;
  const loading = isLoading || isActionLoading;

  const canDelete = useMemo(() => isAdmin, [isAdmin]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Group name is required.');
      return;
    }

    try {
      await updateGroup(groupId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
      });

      if (imageUpdated) {
        if (form.image?.uri) {
          await uploadGroupImage(groupId, form.image);
        } else {
          await deleteGroupImage(groupId);
        }
      }

      Alert.alert('Success', 'Group settings updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update group settings.');
    }
  };

  const handleArchiveToggle = async () => {
    const nextArchived = !isArchived;
    try {
      await archiveGroup(groupId, nextArchived);
      setForm((prev) => ({ ...prev, status: nextArchived ? GROUP_STATUS.ARCHIVED : GROUP_STATUS.ACTIVE }));
      Alert.alert('Success', nextArchived ? 'Group archived.' : 'Group activated.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Unable to update group status.');
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Do you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId, authUserId);
              navigation.navigate('Main', { screen: 'Groups' });
            } catch (error) {
              Alert.alert('Error', error?.message || 'Unable to leave group.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Delete this group permanently? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              navigation.navigate('Main', { screen: 'Groups' });
            } catch (error) {
              Alert.alert('Error', error?.message || 'Unable to delete group.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper backgroundColor="#F4F7FB">
      <Header title="Group Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.avatarWrap}>
            <Avatar source={form.image?.uri} name={form.name || groupDetails?.name} size={78} />
          </View>
          <Text style={styles.groupNamePreview}>{form.name || 'Group name'}</Text>
          <Text style={styles.groupStatusPreview}>{isArchived ? 'Archived' : 'Active'}</Text>
        </View>

        <View style={styles.sectionCard}>
          <ImagePickerField
            label="Group Image"
            value={form.image}
            onChange={(image) => {
              setForm((prev) => ({ ...prev, image }));
              setImageUpdated(true);
            }}
          />

          <InputField
            label="Group Name"
            value={form.name}
            onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
            placeholder="Enter group name"
          />

          <InputField
            label="Description"
            value={form.description}
            onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
            placeholder="Group description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusTabs}>
            <TouchableOpacity
              style={[styles.statusTab, !isArchived && styles.statusTabActive]}
              onPress={() => setForm((prev) => ({ ...prev, status: GROUP_STATUS.ACTIVE }))}
            >
              <Text style={[styles.statusTabText, !isArchived && styles.statusTabTextActive]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusTab, isArchived && styles.statusTabActive]}
              onPress={() => setForm((prev) => ({ ...prev, status: GROUP_STATUS.ARCHIVED }))}
            >
              <Text style={[styles.statusTabText, isArchived && styles.statusTabTextActive]}>
                Archived
              </Text>
            </TouchableOpacity>
          </View>

          <Button title="Save Changes" onPress={handleSave} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity style={styles.dangerRow} onPress={handleArchiveToggle}>
            <View style={styles.dangerIconWrap}>
              <Icon name={isArchived ? 'archive-arrow-up-outline' : 'archive-outline'} size={20} color="#B45309" />
            </View>
            <View style={styles.dangerTextWrap}>
              <Text style={styles.dangerTitle}>{isArchived ? 'Unarchive Group' : 'Archive Group'}</Text>
              <Text style={styles.dangerSubTitle}>
                {isArchived
                  ? 'Move this group back to active groups.'
                  : 'Hide this group from active tab.'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerRow} onPress={handleLeaveGroup}>
            <View style={styles.dangerIconWrap}>
              <Icon name="exit-to-app" size={20} color={colors.error} />
            </View>
            <View style={styles.dangerTextWrap}>
              <Text style={styles.dangerTitle}>Leave Group</Text>
              <Text style={styles.dangerSubTitle}>Remove yourself from this group.</Text>
            </View>
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteGroup}>
              <View style={styles.dangerIconWrap}>
                <Icon name="trash-can-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.dangerTextWrap}>
                <Text style={[styles.dangerTitle, { color: colors.error }]}>Delete Group</Text>
                <Text style={styles.dangerSubTitle}>Delete this group and all references.</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  topCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  groupNamePreview: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  groupStatusPreview: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEF6',
    padding: 14,
    marginBottom: 12,
  },
  statusLabel: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#E8EFF7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  statusTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusTabActive: {
    backgroundColor: colors.white,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statusTabTextActive: {
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F8',
  },
  dangerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dangerTextWrap: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  dangerSubTitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default GroupSettingsScreen;
