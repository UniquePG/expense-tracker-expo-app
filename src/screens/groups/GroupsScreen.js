import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
;

const GroupsScreen = ({ navigation }) => {
  const { groups, isLoading, fetchGroups } = useGroups();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = () => {
    fetchGroups();
  };

  const filteredGroups = groups.filter(g => {
    if (filter === 'owed') return g.balance > 0;
    if (filter === 'owe') return g.balance < 0;
    return true;
  });

  const GroupCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={[
            styles.status, 
            { color: item.balance < 0 ? colors.error : item.balance > 0 ? colors.success : colors.textSecondary }
          ]}>
            {item.balance < 0 ? `YOU OWE $${Math.abs(item.balance).toFixed(2)}` : 
             item.balance > 0 ? `YOU ARE OWED $${item.balance.toFixed(2)}` : 
             'ALL SETTLED UP'}
          </Text>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <Text style={styles.members}>
            <Icon name="account-group" size={14} /> {item.members?.length || 0} members
          </Text>
          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View Details</Text>
            <Icon name="chevron-right" size={18} color={colors.primary} />
          </View>
        </View>
        <Avatar source={item.avatar} name={item.name} size={80} radius={16} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Groups</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('GroupsList')}>
            <Icon name="magnify" size={24} color={colors.text} style={{ marginRight: 20 }} />
          </TouchableOpacity>
          <Icon name="dots-vertical" size={24} color={colors.text} />
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={filter === 'all' ? styles.activeFilterText : styles.filterBtnText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'owed' && styles.activeFilter]}
          onPress={() => setFilter('owed')}
        >
          <Text style={filter === 'owed' ? styles.activeFilterText : styles.filterBtnText}>Owed to me</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'owe' && styles.activeFilter]}
          onPress={() => setFilter('owe')}
        >
          <Text style={filter === 'owe' ? styles.activeFilterText : styles.filterBtnText}>I owe</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.list} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {filteredGroups.length > 0 ? (
          filteredGroups.map((item) => <GroupCard key={item.id} item={item} />)
        ) : (
          !isLoading && (
            <EmptyState
              icon="account-group"
              title="No Groups Found"
              message={filter === 'all' ? "You haven't joined any groups yet." : "No groups match your filter."}
              actionTitle={filter === 'all' ? "Create Group" : null}
              onActionPress={() => navigation.navigate('CreateGroup')}
            />
          )
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGroup')}>
        <Icon name="plus" size={30} color={colors.white} />
      </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    marginRight: 12,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  members: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default GroupsScreen;
