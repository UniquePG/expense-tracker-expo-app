import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import Avatar from '../../components/ui/Avatar';
import ImagePickerField from '../../components/ui/ImagePickerField';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../hooks/useGroups';
;

const CreateGroupScreen = ({ navigation }) => {
  const { createGroup, isLoading } = useGroups();
  const { friends, fetchFriends } = useFriends();
  const [form, setForm] = useState({
    name: '',
    type: 'TRIP',
    members: [],
    avatar: null,
  });

  useEffect(() => {
    fetchFriends();
  }, []);

  const groupTypes = [
    { id: 'TRIP', label: 'Trip', icon: 'airplane' },
    { id: 'HOME', label: 'Home', icon: 'home' },
    { id: 'COUPLE', label: 'Couple', icon: 'heart' },
    { id: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
  ];

  const handleCreate = async () => {
    if (!form.name) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      await createGroup(form);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create group');
    }
  };

  const toggleMember = (friendId) => {
    setForm(prev => {
      const isSelected = prev.members.includes(friendId);
      if (isSelected) {
        return { ...prev, members: prev.members.filter(id => id !== friendId) };
      } else {
        return { ...prev, members: [...prev.members, friendId] };
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
          <Text style={styles.doneBtn}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.imageSection}>
          <ImagePickerField 
            value={form.avatar}
            onChange={(uri) => setForm({...form, avatar: uri})}
          />
          <View style={styles.nameInputContainer}>
            <Text style={styles.label}>Group Name</Text>
            <InputField 
              placeholder="e.g. Summer Trip 2024" 
              value={form.name} 
              onChangeText={(t) => setForm({...form, name: t})} 
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Group Type</Text>
        <View style={styles.typeGrid}>
          {groupTypes.map((type) => (
            <TouchableOpacity 
              key={type.id} 
              style={[
                styles.typeCard, 
                form.type === type.id && styles.activeTypeCard
              ]}
              onPress={() => setForm({...form, type: type.id})}
            >
              <Icon 
                name={type.icon} 
                size={24} 
                color={form.type === type.id ? colors.white : colors.primary} 
              />
              <Text style={[
                styles.typeLabel,
                form.type === type.id && styles.activeTypeLabel
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select Members</Text>
        <View style={styles.memberList}>
          {friends.map((friend) => (
            <TouchableOpacity 
              key={friend.id} 
              style={styles.memberItem}
              onPress={() => toggleMember(friend.id)}
            >
              <Avatar source={friend.avatar} name={friend.name} size={40} radius={12} />
              <Text style={styles.memberName}>{friend.name}</Text>
              <Icon 
                name={form.members.includes(friend.id) ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                size={24} 
                color={form.members.includes(friend.id) ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
          ))}
          {friends.length === 0 && (
            <Text style={styles.emptyText}>No friends to add. Add friends first!</Text>
          )}
        </View>

        <Button 
          title="Create Group" 
          style={styles.createBtn} 
          onPress={handleCreate} 
          loading={isLoading}
        />
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  doneBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    padding: 24,
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  nameInputContainer: {
    flex: 1,
    marginLeft: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  typeCard: {
    width: '23%',
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTypeCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  activeTypeLabel: {
    color: colors.white,
  },
  memberList: {
    marginBottom: 40,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
  },
  createBtn: {
    height: 60,
    borderRadius: 30,
    marginBottom: 60,
  },
});

export default CreateGroupScreen;
