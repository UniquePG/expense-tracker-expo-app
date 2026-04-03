import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
;

const SearchInput = ({ value, onChangeText, placeholder = 'Search...', style }) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
});

export default SearchInput;
