import { ENDPOINTS } from '../constants/apiEndpoints';
import axiosClient from './axiosClient';

const toNumericIfPossible = (value) => {
  if (value === null || value === undefined || value === '') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRoot = (response) => {
  if (!response) return {};
  if (Array.isArray(response)) return { data: response };
  if (typeof response !== 'object') return { data: response };
  return response;
};

const asObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const extractCollection = (root, keys = []) => {
  if (Array.isArray(root)) return root;
  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
    if (Array.isArray(root?.data?.[key])) return root.data[key];
  }
  if (Array.isArray(root?.data)) return root.data;
  return [];
};

const extractEntity = (root, keys = []) => {
  if (!root || typeof root !== 'object') return null;
  for (const key of keys) {
    if (root?.[key] && typeof root[key] === 'object') return root[key];
    if (root?.data?.[key] && typeof root.data[key] === 'object') return root.data[key];
  }
  if (root?.data && typeof root.data === 'object' && !Array.isArray(root.data)) return root.data;
  return root;
};

const getPersonName = (person) => {
  if (!person) return 'Unknown';
  if (person.name) return person.name;
  const composed = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
  return composed || person.email || 'Unknown';
};

const normalizeMember = (member) => {
  const user = member?.user || null;
  const contact = member?.contact || null;
  const userId = member?.userId ?? user?.id ?? null;
  const contactId = member?.contactId ?? contact?.id ?? null;
  const identityId = userId ?? contactId ?? member?.id;
  const name = user ? getPersonName(user) : contact ? getPersonName(contact) : member?.name || 'Unknown';

  return {
    id: member?.id ?? identityId,
    identityId,
    userId,
    contactId,
    name,
    email: user?.email || contact?.email || member?.email || '',
    avatar: user?.avatar || contact?.avatar || member?.avatar || null,
    isAdmin: Boolean(member?.isAdmin),
    joinedAt: member?.joinedAt || member?.createdAt || null,
    status: member?.status || 'ACTIVE',
    source: userId ? 'user' : 'contact',
    raw: member,
  };
};

const normalizeExpense = (expense) => ({
  id: expense?.id,
  groupId: expense?.groupId || null,
  description: expense?.description || expense?.title || 'Expense',
  amount: toAmount(expense?.amount),
  currency: expense?.currency || 'INR',
  expenseDate: expense?.expenseDate || expense?.date || expense?.createdAt || null,
  notes: expense?.notes || '',
  paidById: expense?.paidById ?? expense?.paidBy?.id ?? null,
  paidByName: getPersonName(expense?.paidBy),
  categoryName: expense?.category?.name || expense?.categoryName || 'General',
  categoryColor: expense?.category?.color || null,
  categoryIcon: expense?.category?.icon || null,
  splits: Array.isArray(expense?.splits) ? expense.splits : [],
  raw: expense,
});

const normalizeGroup = (group) => {
  const members = Array.isArray(group?.members) ? group.members.map(normalizeMember) : [];
  const expenses = Array.isArray(group?.expenses) ? group.expenses.map(normalizeExpense) : [];

  return {
    id: group?.id,
    name: group?.name || 'Unnamed Group',
    description: group?.description || '',
    status: group?.status || 'ACTIVE',
    image: group?.image || group?.avatar || null,
    createdBy: group?.createdBy || group?.creator?.id || null,
    createdAt: group?.createdAt || null,
    updatedAt: group?.updatedAt || null,
    lastActivityAt: group?.lastActivityAt || group?.updatedAt || group?.createdAt || null,
    memberCount: group?.memberCount ?? group?._count?.members ?? members.length,
    expenseCount: group?.expenseCount ?? group?._count?.expenses ?? expenses.length,
    members,
    expenses,
    totalSpent: toAmount(group?.totalSpent),
    balance: toAmount(group?.myBalance ?? group?.netBalance ?? group?.balance),
    myBalance: toAmount(group?.myBalance ?? group?.netBalance ?? group?.balance),
    isAdmin: Boolean(group?.isAdmin || group?.isCurrentUserAdmin),
    raw: group,
  };
};

const normalizeBalances = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    memberId: item?.memberId || item?.id || null,
    userId: item?.user?.id ?? item?.userId ?? null,
    contactId: item?.contact?.id ?? item?.contactId ?? null,
    name: item?.name || getPersonName(item?.user || item?.contact),
    avatar: item?.avatar || item?.user?.avatar || item?.contact?.avatar || null,
    isAdmin: Boolean(item?.isAdmin),
    totalPaid: toAmount(item?.totalPaid),
    totalOwes: toAmount(item?.totalOwes),
    balance: toAmount(item?.balance),
    user: item?.user || null,
    contact: item?.contact || null,
    raw: item,
  }));

export const groupsApi = {
  create: async (data) => {
    const payload = {
      ...data,
      memberIds: Array.isArray(data?.memberIds)
        ? data.memberIds.map(toNumericIfPossible)
        : undefined,
    };
    const response = await axiosClient.post(ENDPOINTS.GROUPS.BASE, payload);
    const root = getRoot(response);
    const group = normalizeGroup(extractEntity(root, ['group']));
    return { ...asObject(root), data: group, group };
  },
  getAll: async (params) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.BASE, { params });
    const root = getRoot(response);
    const groups = extractCollection(root, ['groups']).map(normalizeGroup);
    return { ...asObject(root), data: groups, groups, meta: root?.meta || null };
  },
  getById: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.ID(id));
    const root = getRoot(response);
    console.log("root ", root)
    const group = normalizeGroup(extractEntity(root, ['group']));
    return { ...asObject(root), data: group, group };
  },
  update: async (id, data) => {
    const response = await axiosClient.put(ENDPOINTS.GROUPS.ID(id), data);
    const root = getRoot(response);
    const group = normalizeGroup(extractEntity(root, ['group']));
    return { ...asObject(root), data: group, group };
  },
  delete: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.GROUPS.ID(id));
    const root = getRoot(response);
    return { ...asObject(root), data: root?.data ?? null };
  },
  getMembers: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.MEMBERS(id));
    const root = getRoot(response);
    const members = extractCollection(root, ['members']).map(normalizeMember);
    return { ...asObject(root), data: members, members };
  },
  addMember: async (id, memberPayload) => {
    const payload =
      typeof memberPayload === 'object'
        ? {
            ...memberPayload,
            userId: toNumericIfPossible(memberPayload?.userId),
            contactId: toNumericIfPossible(memberPayload?.contactId),
          }
        : { userId: toNumericIfPossible(memberPayload) };

    const response = await axiosClient.post(ENDPOINTS.GROUPS.MEMBERS(id), payload);
    const root = getRoot(response);
    const member = normalizeMember(extractEntity(root, ['member']));
    return { ...asObject(root), data: member, member };
  },
  removeMember: async (groupId, memberId) => {
    const response = await axiosClient.delete(
      `${ENDPOINTS.GROUPS.MEMBERS(groupId)}/${toNumericIfPossible(memberId)}`
    );
    const root = getRoot(response);
    return { ...asObject(root), data: root?.data ?? null };
  },
  toggleMemberAdmin: async (groupId, memberId, isAdmin) => {
    const response = await axiosClient.put(
      ENDPOINTS.GROUPS.MEMBER_ADMIN(groupId, memberId),
      { isAdmin: Boolean(isAdmin) }
    );
    const root = getRoot(response);
    const member = normalizeMember(extractEntity(root, ['member']));
    return { ...asObject(root), data: member, member };
  },
  getExpenses: async (id, params) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.EXPENSES(id), { params });
    const root = getRoot(response);
    const expenses = extractCollection(root, ['expenses']).map(normalizeExpense);
    return { ...asObject(root), data: expenses, expenses, meta: root?.meta || null };
  },
  getBalances: async (id) => {
    const response = await axiosClient.get(ENDPOINTS.GROUPS.BALANCES(id));
    const root = getRoot(response);
    const balances = normalizeBalances(extractCollection(root, ['balances']));
    return { ...asObject(root), data: balances, balances };
  },
  settle: async (id) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.SETTLE(id));
    const root = getRoot(response);
    return { ...asObject(root), data: root?.data ?? null };
  },
  uploadImage: async (id, formData) => {
    const response = await axiosClient.post(ENDPOINTS.GROUPS.IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const root = getRoot(response);
    const group = normalizeGroup(extractEntity(root, ['group']));
    return { ...asObject(root), data: group, group };
  },
  deleteImage: async (id) => {
    const response = await axiosClient.delete(ENDPOINTS.GROUPS.IMAGE(id));
    const root = getRoot(response);
    const group = normalizeGroup(extractEntity(root, ['group']));
    return { ...asObject(root), data: group, group };
  },
};

export default groupsApi;
