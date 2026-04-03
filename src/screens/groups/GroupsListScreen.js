import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FloatingActionButton from '../../components/buttons/FloatingActionButton';
import SearchInput from '../../components/inputs/SearchInput';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
;

const GroupsListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { groups, isLoading, fetchGroups } = useGroups();

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const GroupItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, title: item.name })}
    >
      <Card style={styles.groupCard}>
        <Avatar source={item.avatar} name={item.name} size={60} />
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>{item.members?.length || 0} members</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { color: item.balance >= 0 ? colors.success : colors.error }]}>
            {item.balance >= 0 ? 'You are owed' : 'You owe'}
          </Text>
          <Text style={[styles.balanceValue, { color: item.balance >= 0 ? colors.success : colors.error }]}>
            ${Math.abs(item.balance || 0).toFixed(2)}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Header title="Groups" showBack />
      <View style={styles.searchContainer}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search groups..."
        />
      </View>
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GroupItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchGroups} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="account-group"
              title="No Groups Found"
              message={search ? "Try a different search term." : "You haven't joined any groups yet."}
              actionTitle={search ? null : "Create Group"}
              onActionPress={() => navigation.navigate('CreateGroup')}
            />
          )
        }
      />
      <FloatingActionButton 
        icon="plus" 
        onPress={() => navigation.navigate('CreateGroup')} 
      />
      <LoadingOverlay visible={isLoading && groups.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  memberCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default GroupsListScreen;
