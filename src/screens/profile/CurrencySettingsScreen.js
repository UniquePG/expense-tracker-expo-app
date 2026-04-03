import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { userApi } from '../../api';
import Header from '../../components/ui/Header';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
;

const currencies = [
  { label: 'US Dollar (USD)', value: 'USD', symbol: '$' },
  { label: 'Euro (EUR)', value: 'EUR', symbol: '€' },
  { label: 'British Pound (GBP)', value: 'GBP', symbol: '£' },
  { label: 'Indian Rupee (INR)', value: 'INR', symbol: '₹' },
  { label: 'Japanese Yen (JPY)', value: 'JPY', symbol: '¥' },
];

const CurrencySettingsScreen = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  // console.log('user :', user);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [loading, setLoading] = useState(false);

  const handleSave = async (currency) => {
    setSelectedCurrency(currency);
    setLoading(true);
    try {
      const response = await userApi.updateProfile({ currency });
      console.log('currency response :', response);
      setUser(response.data.user);
      Toast.show({ type: 'success', text1: 'Currency updated' });
      navigation.goBack();
    } catch (error) {
    console.log('error :', error);
      Toast.show({ type: 'error', text1: 'Failed to update currency' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Currency Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Select your preferred currency for display and calculations.</Text>
        {currencies.map((item) => (
          <TouchableOpacity 
            key={item.value} 
            style={[styles.item, selectedCurrency === item.value && styles.selectedItem]}
            onPress={() => handleSave(item.value)}
          >
            <View style={styles.itemLeft}>
              <View style={styles.symbolContainer}>
                <Text style={styles.symbol}>{item.symbol}</Text>
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
            {selectedCurrency === item.value && (
              <Icon name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default CurrencySettingsScreen;
