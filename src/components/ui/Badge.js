import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const Badge = ({count, size = 20, style}) => {
  const theme = useTheme();

  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.error,
        },
        style,
      ]}>
      <Text style={[styles.text, {fontSize: size * 0.5}]}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -4,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});