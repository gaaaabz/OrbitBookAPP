import { View, Text, StyleSheet } from 'react-native';
import { radius, fontSize } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
}

export default function Badge({ label, color, textColor = '#FFFFFF' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '60' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
