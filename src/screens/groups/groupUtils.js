import dayjs from 'dayjs';

export const GROUP_FILTERS = ['ALL', 'ACTIVE', 'ARCHIVED'];

export const getMemberName = (member) => {
  if (!member) return 'Unknown';
  if (member.name) return member.name;
  const person = member.user || member.contact || {};
  const composed = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
  return composed || person.email || member.email || 'Unknown';
};

export const getMemberAvatar = (member) => {
  if (!member) return null;
  return member.avatar || member.user?.avatar || member.contact?.avatar || null;
};

export const getBalanceMeta = (amount) => {
  const value = Number(amount || 0);
  if (value > 0) {
    return { label: 'You are owed', tone: 'positive' };
  }
  if (value < 0) {
    return { label: 'You owe', tone: 'negative' };
  }
  return { label: 'Settled', tone: 'neutral' };
};

export const formatGroupActivity = (dateValue) => {
  if (!dateValue) return 'No activity yet';
  const date = dayjs(dateValue);
  if (!date.isValid()) return 'No activity yet';
  return `Updated ${date.format('DD MMM YYYY')}`;
};

export const buildSettlementSuggestions = (balances) => {
  const debtors = [];
  const creditors = [];

  balances.forEach((item) => {
    const value = Number(item.balance || 0);
    if (value < 0) debtors.push({ ...item, remaining: Math.abs(value) });
    if (value > 0) creditors.push({ ...item, remaining: value });
  });

  const suggestions = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > 0) {
      suggestions.push({
        from: debtor,
        to: creditor,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.remaining = Number((debtor.remaining - amount).toFixed(2));
    creditor.remaining = Number((creditor.remaining - amount).toFixed(2));

    if (debtor.remaining <= 0) debtorIndex += 1;
    if (creditor.remaining <= 0) creditorIndex += 1;
  }

  return suggestions;
};
