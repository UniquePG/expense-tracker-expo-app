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
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useFriends } from '../../hooks/useFriends';

const MODES = { FRIEND: 'friend', CONTACT: 'contact' };

const AddFriendOrContactScreen = ({ navigation, route }) => {
  const returnTo = route?.params?.returnTo; // e.g. 'CreateGroup'
  const [mode, setMode] = useState(MODES.FRIEND);

  // Friend mode state
  const [email, setEmail] = useState('');
  // Contact mode state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendFriendRequest } = useFriends();

  const reset = () => {
    setEmail('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
  };

  const handleSendFriendRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendFriendRequest(email.trim());
      Alert.alert('Success', 'Friend request sent! They will need to accept it.', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            if (returnTo) {
              navigation.goBack();
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to send friend request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactName.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }
    if (!contactEmail.trim() && !contactPhone.trim()) {
      Alert.alert('Validation', 'Please provide at least an email or phone number.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: contactName.trim(),
        ...(contactEmail.trim() && { email: contactEmail.trim() }),
        ...(contactPhone.trim() && { phone: contactPhone.trim() }),
      };
      await contactsApi.create(payload);
      Alert.alert('Success', `${contactName.trim()} has been added to your contacts.`, [
        {
          text: 'OK',
          onPress: () => {
            reset();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to add contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor="#F4F7FB">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === MODES.FRIEND ? 'Add Friend' : 'Add Contact'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === MODES.FRIEND && styles.modeBtnActive]}
              onPress={() => setMode(MODES.FRIEND)}
            >
              <Icon
                name="account-plus-outline"
                size={18}
                color={mode === MODES.FRIEND ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.modeBtnText, mode === MODES.FRIEND && styles.modeBtnTextActive]}>
                Friend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === MODES.CONTACT && styles.modeBtnActive]}
              onPress={() => setMode(MODES.CONTACT)}
            >
              <Icon
                name="contacts-outline"
                size={18}
                color={mode === MODES.CONTACT ? '#fff' : colors.textSecondary}
              />
              <Text
                style={[styles.modeBtnText, mode === MODES.CONTACT && styles.modeBtnTextActive]}
              >
                Contact
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon
              name={mode === MODES.FRIEND ? 'account-multiple-check-outline' : 'contacts-outline'}
              size={36}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>
              {mode === MODES.FRIEND ? 'Send a Friend Request' : 'Add a Contact'}
            </Text>
            <Text style={styles.infoSubtitle}>
              {mode === MODES.FRIEND
                ? 'Enter their email to send a friend request. They must already be registered on the app.'
                : 'Add someone who may not be on the app yet. You can split expenses with contacts too.'}
            </Text>
          </View>

          {/* Form */}
          {mode === MODES.FRIEND ? (
            <View style={styles.form}>
              <InputField
                label="Email Address"
                placeholder="friend@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button
                title="Send Friend Request"
                onPress={handleSendFriendRequest}
                loading={isSubmitting}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <InputField
                label="Full Name *"
                placeholder="e.g. Ravi Kumar"
                value={contactName}
                onChangeText={setContactName}
              />
              <InputField
                label="Email Address"
                placeholder="contact@example.com"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <InputField
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
              <Text style={styles.fieldHint}>⚠ At least email or phone is required</Text>
              <Button
                title="Add Contact"
                onPress={handleAddContact}
                loading={isSubmitting}
                style={styles.submitBtn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isSubmitting} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#EAF0F8', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  content: { padding: 20, paddingBottom: 60 },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E6EEF8',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 11,
  },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  modeBtnTextActive: { color: '#fff' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6EEF8',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EEF8',
  },
  fieldHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: -4,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitBtn: { marginTop: 8 },
});

export default AddFriendOrContactScreen;
