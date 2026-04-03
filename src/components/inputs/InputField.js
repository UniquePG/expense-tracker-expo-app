import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { colors } from '../../constants/colors';

const InputField = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholder={placeholder}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        style={styles.input}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} color={colors.textSecondary} /> : null}
        right={rightIcon ? <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} color={colors.textSecondary} /> : null}
        {...rest}
      />
      {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  input: {
    backgroundColor: colors.surface,
  },
});

export default InputField;
