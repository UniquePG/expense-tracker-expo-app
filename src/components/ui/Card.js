import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

const Card = ({ children, style, onPress, disabled }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.card, style]} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default Card;
