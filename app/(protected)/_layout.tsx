import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { colors, fontSize } from '../../constants/theme';

function ARIATabButton({ onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected;
  return (
    <Pressable onPress={onPress} style={styles.ariaBtnWrap} android_ripple={null}>
      <View style={[styles.ariaBtn, focused && styles.ariaBtnActive]}>
        <Ionicons name="sparkles" size={15} color={colors.white} />
        <Text style={styles.ariaBtnLabel}>ARIA</Text>
      </View>
    </Pressable>
  );
}

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading) return <LoadingScreen message="Carregando..." />;
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopColor: colors.tabBorder,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* ARIA — tab especial com botão pill */}
      <Tabs.Screen
        name="ai"
        options={{
          title: 'ARIA',
          tabBarButton: (props) => <ARIATabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="destinations"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Telas sem tab bar */}
      <Tabs.Screen name="destination-details" options={{ href: null }} />
      <Tabs.Screen name="booking-detail" options={{ href: null }} />
      <Tabs.Screen name="booking-form" options={{ href: null }} />
      <Tabs.Screen name="add-destination" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ariaBtnWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 4,
  },
  ariaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: colors.primary + '50',
  },
  ariaBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight + '80',
  },
  ariaBtnLabel: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
