import {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {useUIStore} from '../store/uiStore';

export const useNetworkStatus = () => {
  const {setOfflineStatus, isOffline} = useUIStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOfflineStatus(!state.isConnected);
    });

    return () => unsubscribe();
  }, [setOfflineStatus]);

  return isOffline
};