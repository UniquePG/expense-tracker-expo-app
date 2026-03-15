import React from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import {Text, useTheme, HelperText} from 'react-native-paper';
import {formatCurrency, parseCurrencyInput} from '../../utils/formatCurrency';

export const CurrencyInput = ({
  label,
  value,
  onChange,
  currency = 'USD',
  error,
  style,
  placeholder = '0.00',
}) => {
  const theme = useTheme();

  const handleChange = text => {
    const parsed = parseCurrencyInput(text);
    onChange(parsed);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}>
        <Text style={[styles.currencySymbol, {color: theme.colors.primary}]}>
          {formatCurrency(0, currency, {showDecimals: false}).replace('0', '')}
        </Text>
        <TextInput
          value={value ? value.toString() : ''}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="decimal-pad"
          style={[styles.input, {color: theme.colors.text}]}
        />
      </View>
      {error && <HelperText type="error">{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
});