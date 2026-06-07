import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { colors, spacing, radius, fontSize } from '../../constants/theme';

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({ icon, label, onPress, danger }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.danger + '20', borderColor: colors.danger + '40' }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, isLoading, signOut } = useAuth();

  const { data: bookings = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => bookingService.listMine(),
  });

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const memberSince = user?.criado_em
    ? new Date(user.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—';

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMADO' || b.status === 'CONCLUIDO').length;

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Meu Perfil</Text>
      </View>

      {/* Avatar + nome */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.nome ?? '—'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'VIAJANTE'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>Confirmadas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{memberSince.split(' ')[1]}</Text>
          <Text style={styles.statLabel}>Desde {memberSince.split(' ')[0]}</Text>
        </View>
      </View>

      {/* Informações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Nome" value={user?.nome ?? '—'} />
          <View style={styles.divider} />
          <InfoRow icon="mail-outline" label="E-mail" value={user?.email ?? '—'} />
          <View style={styles.divider} />
          <InfoRow icon="shield-checkmark-outline" label="Tipo de conta" value={user?.role ?? '—'} />
          <View style={styles.divider} />
          <InfoRow icon="calendar-outline" label="Membro desde" value={memberSince} />
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <View style={styles.card}>
          <MenuRow icon="calendar-outline" label="Minhas Reservas" onPress={() => router.push('/bookings')} />
          <View style={styles.divider} />
          <MenuRow icon="chatbubble-ellipses-outline" label="Assistente ARIA" onPress={() => router.push('/ai')} />
          <View style={styles.divider} />
          <MenuRow icon="information-circle-outline" label="Sobre o App" onPress={() => router.push('/about')} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <MenuRow icon="log-out-outline" label="Sair da conta" onPress={handleLogout} danger />
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: spacing.md,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary + '25',
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { color: colors.primary, fontSize: 30, fontWeight: '800' },
  userName: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  userEmail: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4 },
  roleBadge: {
    marginTop: 10,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '50',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: { color: colors.primaryLight, fontSize: fontSize.xs, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingVertical: 16,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  statDivider: { width: 1, backgroundColor: colors.border },

  section: { paddingHorizontal: spacing.md, paddingTop: 24 },
  sectionTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  infoValue: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600', marginTop: 2 },

  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '500', flex: 1 },

  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
});
