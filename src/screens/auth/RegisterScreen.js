import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { authApi } from '../../api';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import { colors } from '../../constants/colors';
;

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await authApi.register(form);
      Toast.show({ type: 'success', text1: 'Account created!', text2: 'Please verify your email to continue.' });
      navigation.navigate('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Join SpendWise</Text>
      <Text style={styles.subtitle}>Start managing your finances smarter today.</Text>

      <View style={styles.row}>
        <View style={styles.half}>
          <InputField label="First Name" placeholder="e.g. John" value={form.firstName} onChangeText={(t) => setForm({...form, firstName: t})} />
        </View>
        <View style={styles.half}>
          <InputField label="Last Name" placeholder="e.g. Doe" value={form.lastName} onChangeText={(t) => setForm({...form, lastName: t})} />
        </View>
      </View>

      <InputField label="Email Address" placeholder="name@example.com" value={form.email} onChangeText={(t) => setForm({...form, email: t})} />
      <InputField label="Phone Number" placeholder="+1 (555) 000-0000" value={form.phone} onChangeText={(t) => setForm({...form, phone: t})} />
      <InputField label="Password" placeholder="Create a strong password" secureTextEntry value={form.password} onChangeText={(t) => setForm({...form, password: t})} />

      <Text style={styles.hint}>Must be at least 8 characters long.</Text>

      <Button title="Create Account" onPress={handleRegister} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: colors.white,
    flexGrow: 1,
  },
  backBtn: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
