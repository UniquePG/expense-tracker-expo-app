import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useTheme} from 'react-native-paper';
import {getInitials, getRandomColor} from '../../utils/helpers';

export const Avatar = ({
  source,
  name,
  firstName,
  lastName,
  size = 40,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  
  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();
  const initials = getInitials(firstName, lastName) || getInitials(displayName, '') || '?';
  const backgroundColor = getRandomColor();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: source ? 'transparent' : backgroundColor,
  };

  const textStyleComputed = {
    fontSize: size * 0.4,
    color: '#FFFFFF',
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyle, styles.image, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[containerStyle, styles.container, style]}>
      <Text style={[textStyleComputed, textStyle]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});