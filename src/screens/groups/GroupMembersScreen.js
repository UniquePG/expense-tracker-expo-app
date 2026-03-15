import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList, Alert} from 'react-native';
import {Text, useTheme, Button, IconButton} from 'react-native-paper';
import {useGroups} from '../../hooks/useGroups';
import {useFriends} from '../../hooks/useFriends';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {Avatar} from '../../components/ui/Avatar';
import {Card} from '../../components/ui/Card';
import {SearchInput} from '../../components/inputs/SearchInput';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {EmptyState} from '../../components/ui/EmptyState';

export const GroupMembersScreen = ({navigation, route}) => {
  const {id, mode} = route.params;
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    currentGroup,
    fetchGroupDetails,
    addMember,
    removeMember,
  } = useGroups();
  
  const {friends} = useFriends({autoFetch: true});

  useEffect(() => {
    fetchGroupDetails(id);
  }, [id]);

  const existingMemberIds = currentGroup?.members?.map(m => m.id) || [];
  
  const availableFriends = friends.filter(
    f => !existingMemberIds.includes(f.id)
  ).filter(f => {
    if (!searchQuery) return true;
    const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleAddMember = async (friendId) => {
    try {
      setIsLoading(true);
      await addMember(id, friendId);
      // Refresh to show updated list
      await fetchGroupDetails(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.firstName} from this group?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await removeMember(id, member.id);
              await fetchGroupDetails(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderCurrentMember = ({item}) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberRow}>
        <Avatar
          source={item.avatar ? {uri: item.avatar} : null}
          firstName={item.firstName}
          lastName={item.lastName}
          size={48}
        />
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, {color: theme.colors.text}]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.memberEmail, {color: theme.colors.textSecondary}]}>
            {item.email}
          </Text>
        </View>
        {!item.isCurrentUser && (
          <IconButton
            icon="close"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleRemoveMember(item)}
          />
        )}
      </View>
    </Card>
  );

  const renderAvailableFriend = ({item}) => (
    <Card style={styles.friendCard} onPress={() => handleAddMember(item.id)}>
      <View style={styles.friendRow}>
        <Avatar
          source={item.avatar ? {uri: item.avatar} : null}
          firstName={item.firstName}
          lastName={item.lastName}
          size={48}
        />
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, {color: theme.colors.text}]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.friendEmail, {color: theme.colors.textSecondary}]}>
            {item.email}
          </Text>
        </View>
        <Button mode="contained" compact>
          Add
        </Button>
      </View>
    </Card>
  );

  if (mode === 'add') {
    return (
      <ScreenWrapper safeArea={true}>
        <Header
          title="Add Members"
          onBack={() => navigation.goBack()}
        />

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search friends..."
          style={styles.searchInput}
        />

        {availableFriends.length === 0 ? (
          <EmptyState
            icon="account-check"
            title="No available friends"
            message="All your friends are already in this group"
          />
        ) : (
          <FlatList
            data={availableFriends}
            keyExtractor={(item) => item.id}
            renderItem={renderAvailableFriend}
            contentContainerStyle={styles.listContent}
          />
        )}

        <LoadingOverlay visible={isLoading} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Group Members"
        subtitle={`${currentGroup?.members?.length || 0} members`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={currentGroup?.members || []}
        keyExtractor={(item) => item.id}
        renderItem={renderCurrentMember}
        contentContainerStyle={styles.listContent}
      />

      <Button
        mode="contained"
        icon="account-plus"
        onPress={() => navigation.navigate('GroupMembers', {id, mode: 'add'})}
        style={styles.addButton}>
        Add Member
      </Button>

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  memberCard: {
    marginBottom: 8,
    padding: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  friendCard: {
    marginBottom: 8,
    padding: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    margin: 16,
  },
});