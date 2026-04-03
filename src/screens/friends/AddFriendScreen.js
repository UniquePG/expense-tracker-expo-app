import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import InputField from '../../components/inputs/InputField';
import Button from '../../components/buttons/Button';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { colors } from '../../constants/colors';

const AddFriendScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { sendFriendRequest, isLoading } = useFriends();

  const handleSendRequest = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await sendFriendRequest(email);
      Alert.alert('Success', 'Friend request sent!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send request');
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Add Friend" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.circle}>
            <Text style={styles.icon}>@</Text>
          </View>
        </View>
        <Text style={styles.title}>Send a Friend Request</Text>
        <Text style={styles.subtitle}>Enter your friend&apos;s email address to add them to SpendWise.</Text>
        
        <InputField
          label="Email Address"
          placeholder="friend@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button 
          title="Send Request" 
          onPress={handleSendRequest} 
          loading={isLoading} 
          style={styles.button}
        />
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 40,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    marginTop: 16,
  },
});

export default AddFriendScreen;
