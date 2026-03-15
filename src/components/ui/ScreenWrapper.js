import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

export const ScreenWrapper = ({
  children,
  style,
  safeArea = true,
  statusBarStyle = 'dark-content',
  backgroundColor,
}) => {
  const theme = useTheme();
  const bgColor = backgroundColor || theme.colors.background;

  const content = (
    <View style={[styles.container, {backgroundColor: bgColor}, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={bgColor} />
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: bgColor}]}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});