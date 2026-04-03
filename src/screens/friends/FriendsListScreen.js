import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import FriendCard from '../../components/cards/FriendCard';
import SearchInput from '../../components/inputs/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import FloatingActionButton from '../../components/buttons/FloatingActionButton';
import { colors } from '../../constants/colors';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const FriendsListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { friends, isLoading, fetchFriends } = useFriends();

  useEffect(() => {
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((f) =>
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper>
      <Header title="Friends" showBack />
      <View style={styles.searchContainer}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search friends..."
        />
      </View>
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard 
            friend={item} 
            onPress={() => navigation.navigate('FriendProfile', { friendId: item.id })} 
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchFriends} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              icon="account-off"
              title="No Friends Found"
              message={search ? "Try a different search term." : "You haven't added any friends yet."}
              actionTitle={search ? null : "Add Friend"}
              onActionPress={() => navigation.navigate('AddFriend')}
            />
          )
        }
      />
      <FloatingActionButton 
        icon="account-plus" 
        onPress={() => navigation.navigate('AddFriend')} 
      />
      <LoadingOverlay visible={isLoading && friends.length === 0} />
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
});

export default FriendsListScreen;
