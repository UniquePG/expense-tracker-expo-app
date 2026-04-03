import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

const Badge = ({ count, size = 20, style }) => {
  if (count === 0) return null;

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: size / 2 },
      style
    ]}>
      <Text style={[styles.text, { fontSize: size * 0.5 }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  text: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default Badge;
