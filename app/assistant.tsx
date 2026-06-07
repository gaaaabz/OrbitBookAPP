import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/theme';

export default function AssistantRedirect() {
  useEffect(() => {
    router.replace('/ai');
  }, []);
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
}
