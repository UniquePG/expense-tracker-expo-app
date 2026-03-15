import React from 'react';
import {View, StyleSheet, ActivityIndicator, Modal} from 'react-native';
import {useTheme, Text} from 'react-native-paper';

export const LoadingOverlay = ({visible, message = 'Loading...'}) => {
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message && (
            <Text style={[styles.message, {color: theme.colors.text}]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 140,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});