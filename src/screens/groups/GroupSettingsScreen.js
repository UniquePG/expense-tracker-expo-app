import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import Avatar from '../../components/ui/Avatar';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
;

const GroupSettingsScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { getGroupDetails, groupDetails, updateGroup, deleteGroup, isLoading } = useGroups();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getGroupDetails(groupId);
  }, [groupId]);

  useEffect(() => {
    if (groupDetails) {
      setName(groupDetails.name);
      setDescription(groupDetails.description || '');
    }
  }, [groupDetails]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      await updateGroup(groupId, { name, description });
      Alert.alert('Success', 'Group updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Update failed');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              Alert.alert('Success', 'Group deleted');
              navigation.navigate('GroupsList');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete group');
            }
          }
        },
      ]
    );
  };

  if (!groupDetails && !isLoading) return null;

  return (
    <ScreenWrapper>
      <Header title="Group Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar source={groupDetails?.avatar} name={groupDetails?.name} size={100} radius={50} />
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Text style={styles.editAvatarText}>Change Icon</Text>
          </TouchableOpacity>
        </View>

        <InputField
          label="Group Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter group name"
        />
        <InputField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter group description"
          multiline
          numberOfLines={3}
        />

        <Button 
          title="Save Changes" 
          onPress={handleUpdate} 
          loading={isLoading} 
          style={styles.saveBtn}
        />

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <TouchableOpacity style={styles.dangerItem} onPress={handleDelete}>
            <View style={styles.dangerIcon}>
              <Icon name="delete-outline" size={24} color={colors.error} />
            </View>
            <Text style={styles.dangerText}>Delete Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoadingOverlay visible={isLoading && !groupDetails} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatarBtn: {
    marginTop: 12,
  },
  editAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveBtn: {
    marginTop: 24,
  },
  dangerSection: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dangerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
    letterSpacing: 1,
    marginBottom: 16,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});

export default GroupSettingsScreen;
