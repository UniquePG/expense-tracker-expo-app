import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { contactsApi } from '../../api';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Avatar from '../../components/ui/Avatar';
import { colors } from '../../constants/colors';

const ContactDetailScreen = ({ route, navigation }) => {
  const { contact, onDelete, onUpdate } = route.params || {};

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phone, setPhone] = useState(contact?.phone || contact?.phoneNumber || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Validation', 'Please provide at least an email or phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        ...(email.trim() && { email: email.trim() }),
        ...(phone.trim() && { phone: phone.trim() }),
      };
      const response = await contactsApi.update(contact.id, payload);
      const root = response?.data ?? response;
      const updated = root?.contact || root?.data || { ...contact, ...payload };

      if (onUpdate) onUpdate({ ...contact, ...updated });
      setIsEditing(false);
      Alert.alert('Success', 'Contact updated successfully.');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await contactsApi.remove(contact.id);
              if (onDelete) onDelete();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error?.message || 'Failed to delete contact.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            if (isEditing) {
              // Cancel edit — reset fields
              setName(contact?.name || '');
              setEmail(contact?.email || '');
              setPhone(contact?.phone || contact?.phoneNumber || '');
            }
            setIsEditing((v) => !v);
          }}
        >
          <Icon
            name={isEditing ? 'close' : 'pencil-outline'}
            size={22}
            color={isEditing ? colors.error : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Avatar & Name Hero */}
          <View style={styles.hero}>
            <Avatar source={contact?.avatar} name={name || 'C'} size={84} />
            <Text style={styles.heroName}>{name || 'Contact'}</Text>
            {!isEditing && (
              <View style={styles.heroBadge}>
                <Icon name="contacts-outline" size={13} color={colors.primary} />
                <Text style={styles.heroBadgeText}>Contact</Text>
              </View>
            )}
          </View>

          {isEditing ? (
            /* Edit Form */
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Edit Contact</Text>
              <InputField
                label="Full Name *"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ravi Kumar"
              />
              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <InputField
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
              <Button title="Save Changes" onPress={handleSave} loading={isSubmitting} style={{ marginTop: 4 }} />
            </View>
          ) : (
            /* View Mode */
            <View style={styles.infoCard}>
              {email ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Icon name="email-outline" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{email}</Text>
                  </View>
                </View>
              ) : null}
              {phone ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Icon name="phone-outline" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{phone}</Text>
                  </View>
                </View>
              ) : null}
              {!email && !phone && (
                <Text style={styles.noInfo}>No contact information available.</Text>
              )}
            </View>
          )}

          {/* Actions */}
          {!isEditing && (
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setIsEditing(true)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E8F0FE' }]}>
                  <Icon name="pencil-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Edit Contact</Text>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity style={styles.actionRow} onPress={handleDelete}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEEDEE' }]}>
                  <Icon name="trash-can-outline" size={20} color={colors.error} />
                </View>
                <Text style={[styles.actionText, { color: colors.error }]}>Delete Contact</Text>
                <Icon name="chevron-right" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isSubmitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#EAF0F8', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  content: { padding: 16, paddingBottom: 60 },
  hero: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EFF8',
  },
  heroName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 12 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6, backgroundColor: '#EAF8FC',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EFF8',
  },
  formTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 12 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EFF8',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#EAF8FC', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  infoLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  noInfo: { color: colors.textSecondary, textAlign: 'center', padding: 16 },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8EFF8',
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  actionDivider: { height: 1, backgroundColor: '#EEF2F8', marginHorizontal: 12 },
});

export default ContactDetailScreen;
