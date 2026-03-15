import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}>
      <Icon
        name="magnify"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, {color: theme.colors.text}]}
        {...props}
      />
      {value?.length > 0 && (
        <Icon
          name="close-circle"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.clearIcon}
          onPress={onClear || (() => onChangeText(''))}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  clearIcon: {
    marginLeft: 8,
  },
});