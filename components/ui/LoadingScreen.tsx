import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
