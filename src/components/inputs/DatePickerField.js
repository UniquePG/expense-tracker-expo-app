import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatDate } from '../../utils/dateFormatter';

export const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  style,
  maximumDate,
  minimumDate,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      <TouchableOpacity
        onPress={showDatepicker}
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}>
        <Text
          style={[
            styles.dateText,
            {
              color: value ? theme.colors.text : theme.colors.placeholder,
            },
          ]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Icon
          name="calendar"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 16,
  },
});