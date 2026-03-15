import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Text, useTheme, Snackbar, Chip} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {groupSchema} from '../../utils/validationSchemas';
import {useGroups} from '../../hooks/useGroups';
import {useFriends} from '../../hooks/useFriends';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {SelectField} from '../../components/inputs/SelectField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {Avatar} from '../../components/ui/Avatar';

export const CreateGroupScreen = ({navigation}) => {
  const theme = useTheme();
  const {createGroup} = useGroups();
  const {friends} = useFriends({autoFetch: true});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const toggleMember = (friendId) => {
    setSelectedMembers(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const onSubmit = async (data) => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const groupData = {
        ...data,
        members: selectedMembers,
      };

      await createGroup(groupData);
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Create Group"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <Controller
            control={control}
            name="name"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Group Name"
                placeholder="e.g., Weekend Trip, Apartment, etc."
                value={value}
                onChangeText={onChange}
                leftIcon="account-group"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Description (Optional)"
                placeholder="What's this group for?"
                value={value}
                onChangeText={onChange}
                leftIcon="text"
                multiline
                numberOfLines={2}
                error={errors.description?.message}
              />
            )}
          />

          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Select Members
          </Text>
          
          <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
            Choose friends to add to this group
          </Text>

          <View style={styles.membersList}>
            {friends.map(friend => {
              const isSelected = selectedMembers.includes(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.memberItem,
                    isSelected && {backgroundColor: theme.colors.primaryLight}
                  ]}
                  onPress={() => toggleMember(friend.id)}>
                  <Avatar
                    source={friend.avatar ? {uri: friend.avatar} : null}
                    firstName={friend.firstName}
                    lastName={friend.lastName}
                    size={40}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, {color: theme.colors.text}]}>
                      {friend.firstName} {friend.lastName}
                    </Text>
                    <Text style={[styles.memberEmail, {color: theme.colors.textSecondary}]}>
                      {friend.email}
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {friends.length === 0 && (
            <View style={styles.noFriends}>
              <Text style={{color: theme.colors.textSecondary, textAlign: 'center'}}>
                You don't have any friends yet. Add friends first to create a group.
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('AddFriend')}
                style={styles.addFriendButton}>
                Add Friends
              </Button>
            </View>
          )}

          <Button
            title="Create Group"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading || friends.length === 0}
            style={styles.createButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Creating group..." />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{label: 'Dismiss', onPress: () => setError(null)}}>
        {error}
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  membersList: {
    marginBottom: 24,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  noFriends: {
    padding: 24,
    alignItems: 'center',
  },
  addFriendButton: {
    marginTop: 16,
  },
  createButton: {
    marginTop: 8,
  },
});