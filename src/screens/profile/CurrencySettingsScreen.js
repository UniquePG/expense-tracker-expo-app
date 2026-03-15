import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {Text, useTheme, RadioButton} from 'react-native-paper';
import {useUserStore} from '../../store/userStore';
import {userApi} from '../../api/userApi';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {SearchInput} from '../../components/inputs/SearchInput';
import {Card} from '../../components/ui/Card';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {CURRENCIES} from '../../constants/constants';

export const CurrencySettingsScreen = ({navigation}) => {
  const theme = useTheme();
  const {profile} = useUserStore();
  console.log('profile :', profile);
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.user?.currency || 'USD');

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCurrencies = CURRENCIES.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.symbol.includes(query)
    );
  });

  const handleSelect = async (currencyCode) => {
    if (currencyCode === selectedCurrency) return;
    
    try {
      setIsLoading(true);
      await userApi.updateProfile({currency: currencyCode});
      setSelectedCurrency(currencyCode);
      setTimeout(() => navigation.goBack(), 500);
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrencyItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.code)}>
      <Card style={styles.currencyCard}>
        <View style={styles.currencyRow}>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencySymbol, {color: theme.colors.text}]}>
              {item.symbol}
            </Text>
            <View style={styles.currencyDetails}>
              <Text style={[styles.currencyName, {color: theme.colors.text}]}>
                {item.name}
              </Text>
              <Text style={[styles.currencyCode, {color: theme.colors.textSecondary}]}>
                {item.code}
              </Text>
            </View>
          </View>
          <RadioButton
            value={item.code}
            status={selectedCurrency === item.code ? 'checked' : 'unchecked'}
            onPress={() => handleSelect(item.code)}
            color={theme.colors.primary}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Default Currency"
        onBack={() => navigation.goBack()}
      />

      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search currencies..."
        style={styles.searchInput}
      />

      <FlatList
        data={filteredCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={renderCurrencyItem}
        contentContainerStyle={styles.listContent}
      />

      <LoadingOverlay visible={isLoading} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  currencyCard: {
    marginBottom: 8,
    padding: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 40,
  },
  currencyDetails: {
    marginLeft: 12,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyCode: {
    fontSize: 12,
    marginTop: 2,
  },
});