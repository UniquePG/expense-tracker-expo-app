import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

const Divider = ({ style }) => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
});

export default Divider;
