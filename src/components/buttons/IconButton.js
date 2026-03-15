import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

export const IconButton = ({
  icon,
  onPress,
  size = 24,
  color,
  style,
  disabled = false,
  badge,
}) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.7}>
      <Icon name={icon} size={size} color={iconColor} />
      {badge}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});