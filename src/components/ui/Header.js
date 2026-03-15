import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export const Header = ({
  title,
  subtitle,
  onBack,
  rightAction,
  rightIcon,
  onRightPress,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}, style]}>
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, {color: theme.colors.text}]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          <Icon name={rightIcon} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightButton: {
    padding: 4,
    marginLeft: 16,
  },
});