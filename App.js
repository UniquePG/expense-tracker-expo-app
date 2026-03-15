import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {AppNavigator} from './src/navigation/AppNavigator';
import {useUIStore} from './src/store/uiStore';
import {lightTheme, darkTheme} from './src/constants/theme';

export default function App() {
  const {theme} = useUIStore();
  const isDark = theme === 'dark';

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}