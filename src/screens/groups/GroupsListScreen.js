import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FloatingActionButton from '../../components/buttons/FloatingActionButton';
import SearchInput from '../../components/inputs/SearchInput';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  GROUP_FILTERS,
  formatGroupActivity,
  getBalanceMeta,
  getMemberAvatar,
  getMemberName,
} from './groupUtils';

const toneStyles = {
  positive: { bg: '#E8F8F4', text: colors.success },
  negative: { bg: '#FEEDEE', text: colors.error },
  neutral: { bg: '#EFF2F5', text: colors.textSecondary },
};

const GroupsListScreen = ({ navigation }) => {
  const { groups, isLoading, fetchGroups } = useGroups();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [isGridView, setIsGridView] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchGroups().catch(() => null);
    }, [fetchGroups])
  );

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (groups || []).filter((group) => {
      const statusMatch = filter === 'ALL' || (group.status || 'ACTIVE') === filter;
      const searchMatch =
        normalizedSearch.length === 0 ||
        (group.name || '').toLowerCase().includes(normalizedSearch);
      return statusMatch && searchMatch;
    });
  }, [filter, groups, search]);

  const renderMemberStack = (members = [], memberCountValue = 0) => {
    const visibleMembers = members.slice(0, 5);
    const memberCount = memberCountValue || members.length;
    const hiddenCount = Math.max(memberCount - visibleMembers.length, 0);

    return (
      <View style={styles.memberStackRow}>
        <View style={styles.memberStackContainer}>
          {visibleMembers.map((member, index) => (
            <View
              key={`${member.id}-${index}`}
              style={[styles.memberAvatar, { marginLeft: index === 0 ? 0 : -10 }]}
            >
              <Avatar source={getMemberAvatar(member)} name={getMemberName(member)} size={24} />
            </View>
          ))}
          {hiddenCount > 0 && (
            <View style={[styles.memberAvatar, styles.moreMembers]}>
              <Text style={styles.moreMembersText}>+{hiddenCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberCountText}>{memberCount} members</Text>
      </View>
    );
  };

  const renderGroupCard = ({ item }) => {
    const balanceAmount = Number(item.myBalance ?? item.balance ?? 0);
    const balanceMeta = getBalanceMeta(balanceAmount);
    const toneStyle = toneStyles[balanceMeta.tone];
    const members = item.members || [];
    const isArchived = item.status === 'ARCHIVED';

    return (
      <TouchableOpacity
        style={[
          styles.groupCard,
          isGridView && styles.groupCardGrid,
          isArchived && styles.archivedCard,
        ]}
        onPress={() =>
          navigation.navigate('GroupDetails', {
            groupId: item.id,
            title: item.name,
          })
        }
        activeOpacity={0.86}
      >
        <View style={styles.groupTopRow}>
          <Avatar source={item.image} name={item.name} size={48} />
          <View style={styles.groupTitleWrap}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.groupDate}>{formatGroupActivity(item.lastActivityAt)}</Text>
          </View>
          {isArchived && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedBadgeText}>Archived</Text>
            </View>
          )}
        </View>

        {renderMemberStack(members, item.memberCount)}

        <View style={[styles.balanceChip, { backgroundColor: toneStyle.bg }]}>
          <Text style={[styles.balanceChipLabel, { color: toneStyle.text }]}>{balanceMeta.label}</Text>
          <Text style={[styles.balanceChipAmount, { color: toneStyle.text }]}>
            {formatCurrency(Math.abs(balanceAmount))}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const showBack = navigation.canGoBack();

  return (
    <ScreenWrapper backgroundColor="#F4F7FB">
      <Header
        title="Groups"
        showBack={showBack}
        rightElement={
          <TouchableOpacity
            onPress={() => setIsGridView((prev) => !prev)}
            style={styles.viewToggleButton}
          >
            <Icon
              name={isGridView ? 'view-list-outline' : 'view-grid-outline'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.topSection}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search groups"
        />
        <View style={styles.filtersRow}>
          {GROUP_FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item[0] + item.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        key={isGridView ? 'GRID' : 'LIST'}
        data={filteredGroups}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderGroupCard}
        numColumns={isGridView ? 2 : 1}
        columnWrapperStyle={isGridView ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchGroups}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="account-group-outline"
              title="No groups yet"
              message={
                search
                  ? 'No groups match your search.'
                  : 'Create your first group to start splitting expenses together.'
              }
              actionTitle={search ? null : 'Create Group'}
              onActionPress={() => navigation.navigate('CreateGroup')}
            />
          ) : null
        }
      />

      <FloatingActionButton icon="plus" onPress={() => navigation.navigate('CreateGroup')} />
      <LoadingOverlay visible={isLoading && groups.length === 0} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F4F7FB',
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E7EDF3',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EEF4',
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  groupCardGrid: {
    width: '48.5%',
  },
  archivedCard: {
    opacity: 0.78,
  },
  groupTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitleWrap: {
    flex: 1,
    marginLeft: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  groupDate: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  archivedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FDE68A',
  },
  archivedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  memberStackRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberStackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  memberAvatar: {
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#DDE6EE',
  },
  moreMembers: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    backgroundColor: '#C8D5E3',
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F2937',
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  balanceChip: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceChipAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default GroupsListScreen;
