import React from 'react';
import {TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon: Icon,
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.textDisabled;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return disabled ? theme.colors.textDisabled : theme.colors.primary;
    }
    return '#FFFFFF';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {paddingVertical: 8, paddingHorizontal: 16};
      case 'large':
        return {paddingVertical: 16, paddingHorizontal: 32};
      default:
        return {paddingVertical: 12, paddingHorizontal: 24};
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: theme.colors.primary,
        },
        getSizeStyles(),
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {Icon && <Icon style={styles.icon} />}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
              },
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 120,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
});