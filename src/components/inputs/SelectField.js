import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export const SelectField = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  style,
  displayKey = 'label',
  valueKey = 'value',
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt[valueKey] === value);
  const displayValue = selectedOption ? selectedOption[displayKey] : '';

  const handleSelect = item => {
    onSelect(item[valueKey]);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}>
        <Text
          style={[
            styles.selectText,
            {
              color: displayValue ? theme.colors.text : theme.colors.placeholder,
            },
          ]}>
          {displayValue || placeholder}
        </Text>
        <Icon
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.background},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
                {label || 'Select'}
              </Text>
              <Button onPress={() => setModalVisible(false)}>Close</Button>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item[valueKey].toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item[valueKey] && {
                      backgroundColor: theme.colors.primaryLight,
                    },
                  ]}
                  onPress={() => handleSelect(item)}>
                  <Text style={{color: theme.colors.text}}>
                    {item[displayKey]}
                  </Text>
                  {value === item[valueKey] && (
                    <Icon
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  selectText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});