import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { colors } from '../../constants/colors';

const Button = ({ title, onPress, mode = 'contained', loading, disabled, style, labelStyle, icon }) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[styles.button, mode === 'contained' && styles.contained, style]}
      labelStyle={[styles.label, labelStyle]}
      icon={icon}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
  },
  contained: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Button;
