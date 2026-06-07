import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors, fontSize } from '../constants/theme';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/ai' : '/login');
    }
  }, [user, isLoading]);

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>🚀</Text>
      <Text style={styles.brand}>OrbitBook</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logo: { fontSize: 48 },
  brand: { color: colors.textPrimary, fontSize: fontSize['2xl'], fontWeight: '800', letterSpacing: 1 },
  spinner: { marginTop: 32 },
});
