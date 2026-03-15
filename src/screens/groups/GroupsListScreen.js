import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { FloatingActionButton } from '../../components/buttons/FloatingActionButton';
import { GroupCard } from '../../components/cards/GroupCard';
import { SearchInput } from '../../components/inputs/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { useGroups } from '../../hooks/useGroups';

export const GroupsListScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const {
    groups,
    isLoading,
    fetchGroups,
  } = useGroups();

  const filteredGroups = groups.filter(group => {
    if (!searchQuery) return true;
    return group.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderGroupItem = ({item}) => (
    <GroupCard
      group={item}
      onPress={() => navigation.navigate('GroupDetails', {id: item.id})}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="account-group"
      title="No groups yet"
      message="Create a group to start splitting expenses with multiple people"
      actionLabel="Create Group"
      onAction={() => navigation.navigate('CreateGroup')}
    />
  );

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Groups"
        subtitle={`${groups.length} groups`}
      />

      <View style={styles.container}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search groups..."
          style={styles.searchInput}
        />

        {filteredGroups.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.listContent}
            onRefresh={fetchGroups}
            refreshing={isLoading}
          />
        )}
      </View>

      <FloatingActionButton
        onPress={() => navigation.navigate('CreateGroup')}
        style={styles.fab}
      />

      <LoadingOverlay visible={isLoading && groups.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});