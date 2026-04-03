import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const ScreenWrapper = ({ children, style, backgroundColor = colors.background }) => {
  return (
    <SafeAreaView  style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.primary}
      />
      <View style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;
