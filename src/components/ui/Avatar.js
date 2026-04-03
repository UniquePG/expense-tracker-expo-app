import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { getInitials } from '../../utils/helpers';

const Avatar = ({ source, name, size = 40, style }) => {
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  if (source) {
    return (
      <Image 
        source={typeof source === 'string' ? { uri: source } : source} 
        style={containerStyle} 
      />
    );
  }

  return (
    <View style={[containerStyle, styles.placeholder]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

export default Avatar;
