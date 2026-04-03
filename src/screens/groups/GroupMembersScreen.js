import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
;

const GroupMembersScreen = ({ route }) => {
  const { groupId } = route.params;
  const { getGroupDetails, groupDetails, removeGroupMember, isLoading } = useGroups();

  useEffect(() => {
    getGroupDetails(groupId);
  }, [groupId]);

  const handleRemoveMember = (memberId, name) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeGroupMember(groupId, memberId);
              Alert.alert('Success', 'Member removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          }
        },
      ]
    );
  };

  const MemberItem = ({ item }) => (
    <View style={styles.item}>
      <Avatar source={item.avatar} name={item.name} size={50} radius={25} />
      <View style={styles.itemContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveMember(item.id, item.name)}>
        <Icon name="account-remove" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <Header title="Group Members" showBack />
      <FlatList
        data={groupDetails?.members || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => getGroupDetails(groupId)} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="account-group"
              title="No Members"
              description="This group doesn't have any members yet."
            />
          )
        }
      />
      <LoadingOverlay visible={isLoading && !groupDetails} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default GroupMembersScreen;
