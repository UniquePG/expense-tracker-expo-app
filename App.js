import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/constants/theme';
import { useEffect } from 'react';
import { useUserStore } from './src/store/userStore';

export default function App() {

    const {  fetchProfile } = useUserStore();
    // console.log('profile :', profile);
  
    useEffect(() => {
      fetchProfile();
    }, []);


  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style="auto" />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
