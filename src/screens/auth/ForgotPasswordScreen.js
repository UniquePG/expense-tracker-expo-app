import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/buttons/Button';
import InputField from '../../components/inputs/InputField';
import { colors } from '../../constants/colors';
;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="lock-reset" size={80} color={colors.primary} />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          {submitted 
            ? `We've sent a password reset link to ${email}. Please check your inbox.`
            : "Enter your email address and we'll send you a link to reset your password."}
        </Text>

        {!submitted ? (
          <>
            <InputField
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email-outline"
            />
            <Button 
              title="Send Reset Link" 
              onPress={handleReset} 
              style={styles.resetBtn} 
            />
          </>
        ) : (
          <Button 
            title="Back to Login" 
            onPress={() => navigation.navigate('Login')} 
            style={styles.resetBtn} 
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  resetBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
