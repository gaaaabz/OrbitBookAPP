import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../services/bookingService';
import { destinationService } from '../../services/destinationService';
import { colors, spacing, radius, fontSize, statusColor, statusLabel } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = 300;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDuration(dep: string, ret: string): string {
  const diff = Math.round(
    (new Date(ret).getTime() - new Date(dep).getTime()) / (1000 * 60 * 60 * 24)
  );
  return `${diff} ${diff === 1 ? 'dia' : 'dias'}`;
}

// ── Mission timeline ──────────────────────────────────────
const STAGES = [
  { key: 'PENDENTE', label: 'Pendente' },
  { key: 'CONFIRMADO', label: 'Confirmada' },
  { key: 'EM_MISSAO', label: 'Em Missão' },
  { key: 'CONCLUIDO', label: 'Concluída' },
] as const;

function MissionTimeline({ status }: { status: string | null }) {
  const isCanceled = status === 'CANCELADO';
  const currentIdx = STAGES.findIndex((s) => s.key === status);

  if (isCanceled) {
    return (
      <View style={styles.canceledBanner}>
        <View style={styles.canceledIconWrap}>
          <Ionicons name="close-circle" size={26} color={colors.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.canceledTitle}>Missão Cancelada</Text>
          <Text style={styles.canceledSub}>Esta reserva foi encerrada pelo solicitante.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {STAGES.map((stage, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <View key={stage.key} style={styles.timelineStep}>
            {/* dot + connecting lines */}
            <View style={styles.dotRow}>
              {idx > 0 && (
                <View style={[styles.lineHalf, idx <= currentIdx && styles.lineActive]} />
              )}
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isActive && <Ionicons name="checkmark" size={10} color={colors.white} />}
              </View>
              {idx < STAGES.length - 1 && (
                <View style={[styles.lineHalf, idx < currentIdx && styles.lineActive]} />
              )}
            </View>
            <Text
              style={[styles.stepLabel, isActive && styles.stepLabelActive]}
              numberOfLines={2}
            >
              {stage.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Detail row item ───────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIconWrap, { backgroundColor: (accent ?? colors.primary) + '1A' }]}>
        <Ionicons name={icon} size={16} color={accent ?? colors.primary} />
      </View>
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const qc = useQueryClient();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['reserva', bookingId],
    queryFn: () => bookingService.getById(bookingId),
    enabled: !!bookingId,
  });

  const { data: destino, isLoading: destinoLoading } = useQuery({
    queryKey: ['destino', booking?.destino_id],
    queryFn: () => destinationService.getById(booking!.destino_id),
    enabled: !!booking?.destino_id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancel(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] });
      qc.invalidateQueries({ queryKey: ['reserva', bookingId] });
      router.back();
    },
    onError: (err) =>
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível cancelar.'),
  });

  function confirmCancel() {
    Alert.alert(
      'Cancelar missão',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar missão',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Reserva não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = booking.status ?? 'PENDENTE';
  const sColor = statusColor[status] ?? colors.textMuted;
  const sLabel = statusLabel[status] ?? status;
  const canCancel = status === 'PENDENTE' || status === 'CONFIRMADO';
  const preco = Number(booking.valor_total).toLocaleString('pt-BR');
  const duration = getDuration(booking.departure_date, booking.return_date);
  const createdOn = booking.criado_em
    ? new Date(booking.criado_em).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: canCancel ? 110 : 40 }}>

        {/* ── Hero ── */}
        <View style={styles.heroWrap}>
          {destino?.image_url ? (
            <Image source={{ uri: destino.image_url }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.card }]} />
          )}
          <View style={styles.heroTopFade} />
          <View style={styles.heroBotFade} />

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {/* Status badge */}
          <View style={[styles.heroBadge, { backgroundColor: sColor + '28', borderColor: sColor + '70' }]}>
            <View style={[styles.badgeDot, { backgroundColor: sColor }]} />
            <Text style={[styles.heroBadgeText, { color: sColor }]}>{sLabel}</Text>
          </View>

          {/* Destination name */}
          <View style={styles.heroContent}>
            {destinoLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.heroId}>Reserva #{booking.id}</Text>
                <Text style={styles.heroName} numberOfLines={2}>
                  {destino?.nome ?? `Destino #${booking.destino_id}`}
                </Text>
                {destino?.tipo && (
                  <View style={styles.heroTypeBadge}>
                    <Text style={styles.heroTypeText}>{destino.tipo}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.content}>

          {/* ── Mission timeline ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="git-branch-outline" size={15} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Status da Missão</Text>
            </View>
            <MissionTimeline status={status} />
          </View>

          {/* ── Details grid ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Detalhes da Reserva</Text>
            </View>
            <View style={styles.detailList}>
              <DetailRow
                icon="rocket-outline"
                label="Partida"
                value={formatDate(booking.departure_date)}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                icon="flag-outline"
                label="Retorno"
                value={formatDate(booking.return_date)}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                icon="time-outline"
                label="Duração da missão"
                value={duration}
                accent={colors.cyan}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                icon="people-outline"
                label="Passageiros"
                value={`${booking.num_passageiros} pessoa(s)`}
                accent={colors.purple}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                icon="cash-outline"
                label="Valor total"
                value={`R$ ${preco}`}
                accent={colors.success}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                icon="calendar-outline"
                label="Reserva criada em"
                value={createdOn}
                accent={colors.gold}
              />
            </View>
          </View>

          {/* ── Destination shortcut ── */}
          {destino && (
            <TouchableOpacity
              style={styles.destCard}
              onPress={() => router.push(`/destination-details?id=${destino.id}`)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: destino.image_url }}
                style={styles.destThumb}
                resizeMode="cover"
              />
              <View style={styles.destInfo}>
                <Text style={styles.destCardLabel}>Destino da missão</Text>
                <Text style={styles.destCardName} numberOfLines={2}>{destino.nome}</Text>
                {destino.tipo && (
                  <Text style={styles.destCardTipo}>{destino.tipo}</Text>
                )}
              </View>
              <View style={styles.destChevron}>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

      {/* ── Cancel footer ── */}
      {canCancel && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelFooterBtn, cancelMutation.isPending && { opacity: 0.6 }]}
            onPress={confirmCancel}
            disabled={cancelMutation.isPending}
            activeOpacity={0.85}
          >
            {cancelMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.cancelFooterText}>Cancelar esta missão</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  errorLink: { color: colors.primary, fontSize: fontSize.base },

  // Hero
  heroWrap: { position: 'relative', height: HERO_H },
  heroImage: { width: '100%', height: '100%' },
  heroTopFade: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 100,
    backgroundColor: 'rgba(6,12,24,0.55)',
  },
  heroBotFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: 'rgba(6,12,24,0.90)',
  },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(6,12,24,0.65)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadge: {
    position: 'absolute', top: 52, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  heroBadgeText: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.4 },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md, paddingBottom: 20, gap: 6,
  },
  heroId: { color: colors.textSecondary, fontSize: fontSize.xs, letterSpacing: 0.5 },
  heroName: { color: colors.white, fontSize: fontSize['2xl'], fontWeight: '800', lineHeight: 34 },
  heroTypeBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary + '30',
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.primary + '50',
  },
  heroTypeText: { color: colors.primaryLight, fontSize: fontSize.xs, fontWeight: '700' },

  // Content
  content: { padding: spacing.md, gap: 14 },

  // Card
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.primary + '18', justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },

  // Timeline
  canceledBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.danger + '12', borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.danger + '35',
    padding: 14,
  },
  canceledIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.danger + '18',
    justifyContent: 'center', alignItems: 'center',
  },
  canceledTitle: { color: colors.danger, fontWeight: '700', fontSize: fontSize.base },
  canceledSub: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },

  timeline: { flexDirection: 'row', paddingVertical: 4 },
  timelineStep: { flex: 1, alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  lineHalf: { flex: 1, height: 2, backgroundColor: colors.border },
  lineActive: { backgroundColor: colors.primary },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: {
    backgroundColor: colors.primary, borderColor: colors.primaryLight,
    shadowColor: colors.primary, shadowOpacity: 0.6,
    shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  stepLabel: {
    color: colors.textMuted, fontSize: 10, textAlign: 'center',
    marginTop: 8, paddingHorizontal: 2, lineHeight: 14,
  },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },

  // Detail list
  detailList: { gap: 0 },
  detailDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  detailTexts: { flex: 1 },
  detailLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  detailValue: { color: colors.textPrimary, fontWeight: '600', fontSize: fontSize.base, marginTop: 2 },

  // Destination shortcut card
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    gap: 14,
  },
  destThumb: { width: 90, height: 90 },
  destInfo: { flex: 1, paddingVertical: 14 },
  destCardLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 },
  destCardName: { color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.base, lineHeight: 22 },
  destCardTipo: { color: colors.primary, fontSize: fontSize.xs, marginTop: 4, fontWeight: '600' },
  destChevron: { paddingRight: 16 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md, paddingVertical: 14, paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  cancelFooterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: colors.danger + '60',
    backgroundColor: colors.danger + '10',
    paddingVertical: 14, borderRadius: radius.md,
  },
  cancelFooterText: { color: colors.danger, fontWeight: '700', fontSize: fontSize.base },
});
