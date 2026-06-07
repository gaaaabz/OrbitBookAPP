import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { destinationService } from '../../services/destinationService';
import { bookingService } from '../../services/bookingService';
import { avaliacaoService } from '../../services/avaliacaoService';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import type { AvaliacaoItem } from '../../services/types';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Highlights por tipo ───────────────────────────────────
const TIPO_HIGHLIGHTS: Record<string, string[]> = {
  ORBITAL: ['Vista panorâmica completa da Terra', 'Microgravidade por toda a missão', 'Acoplagem com estação espacial'],
  LUNAR: ['Caminhada guiada na superfície lunar', 'Coleta de amostras históricas', 'Vista única da Terra da Lua'],
  MARCIANO: ['Exploração da superfície de Marte', 'Laboratório científico a bordo', 'Paisagens marcianas exclusivas'],
  SUBORBITAL: ['Microgravidade de 3 a 5 minutos', 'Curvatura da Terra claramente visível', 'Treinamento simplificado'],
  ASTEROIDE: ['Mineração experimental no espaço', 'Coleta de materiais raros', 'Missão científica pioneira'],
};

const BASE_HIGHLIGHTS = [
  'Treinamento pré-lançamento completo',
  'Seguro espacial abrangente',
  'Suporte médico 24/7 em órbita',
];

function getHighlights(tipo: string | null): string[] {
  const extra = tipo && TIPO_HIGHLIGHTS[tipo] ? TIPO_HIGHLIGHTS[tipo] : [];
  return [...BASE_HIGHLIGHTS, ...extra].slice(0, 5);
}

const AVATAR_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];
function avatarColor(name: string | null): string {
  if (!name) return '#6B7280';
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ── Stars ────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name =
          i <= Math.floor(rating) ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline';
        return <Ionicons key={i} name={name as any} size={size} color={colors.gold} />;
      })}
    </View>
  );
}

// ── Stat pill ────────────────────────────────────────────
function StatPill({
  icon, value, label, accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <View style={[styles.statPill, accent ? { borderColor: accent + '40', backgroundColor: accent + '0C' } : {}]}>
      <View style={[styles.statIconWrap, accent ? { backgroundColor: accent + '20' } : {}]}>
        <Ionicons name={icon} size={18} color={accent ?? colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Rating bar ───────────────────────────────────────────
function RatingBar({ star, pct, count }: { star: number; pct: number; count: number }) {
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarStar}>{star}</Text>
      <Ionicons name="star" size={10} color={colors.gold} />
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${Math.round(pct)}%` as any }]} />
      </View>
      <Text style={styles.ratingBarCount}>{count}</Text>
    </View>
  );
}

// ── Star selector ─────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.starSelector}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Ionicons
            name={n <= value ? 'star' : 'star-outline'}
            size={38}
            color={n <= value ? colors.gold : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Review card ───────────────────────────────────────────
function ReviewCard({ review }: { review: AvaliacaoItem }) {
  const name = review.usuario_nome ?? 'Viajante Anônimo';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const aColor = avatarColor(review.usuario_nome);
  const date = review.criado_em
    ? new Date(review.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={[styles.avatar, { backgroundColor: aColor }]}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <View style={styles.reviewNameRow}>
            <Text style={styles.reviewName} numberOfLines={1}>{name}</Text>
            <Text style={styles.reviewDate}>{date}</Text>
          </View>
          <Stars rating={review.nota} size={13} />
        </View>
      </View>
      {!!review.comentario && (
        <Text style={styles.reviewComment}>{review.comentario}</Text>
      )}
    </View>
  );
}

// ── Review form ───────────────────────────────────────────
function ReviewForm({
  bookingId,
  destinoId,
  onSuccess,
}: {
  bookingId: number;
  destinoId: number;
  onSuccess: () => void;
}) {
  const qc = useQueryClient();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      avaliacaoService.create({
        booking_id: bookingId,
        nota,
        comentario: comentario.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['avaliacoes', destinoId] });
      qc.invalidateQueries({ queryKey: ['destino', destinoId] });
      onSuccess();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Não foi possível publicar a avaliação.';
      Alert.alert('Erro', msg);
    },
  });

  return (
    <View style={styles.reviewForm}>
      <View style={styles.reviewFormHeader}>
        <Ionicons name="create-outline" size={15} color={colors.primary} />
        <Text style={styles.reviewFormTitle}>Compartilhe sua experiência</Text>
      </View>
      <Text style={styles.reviewFormSubtitle}>Como foi a sua missão?</Text>
      <StarSelector value={nota} onChange={setNota} />
      {nota > 0 && (
        <Text style={styles.notaLabel}>
          {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][nota]}
        </Text>
      )}
      <TextInput
        style={styles.reviewInput}
        placeholder="Conte sobre sua experiência (opcional)"
        placeholderTextColor={colors.textMuted}
        value={comentario}
        onChangeText={setComentario}
        multiline
        maxLength={300}
        numberOfLines={3}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (nota === 0 || mutation.isPending) && styles.submitBtnDisabled,
        ]}
        onPress={() => mutation.mutate()}
        disabled={nota === 0 || mutation.isPending}
        activeOpacity={0.85}
      >
        {mutation.isPending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="paper-plane-outline" size={16} color={colors.white} />
            <Text style={styles.submitBtnText}>Publicar avaliação</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────
export default function DestinationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const destinoId = Number(id);
  const [reviewed, setReviewed] = useState(false);

  const { data: destino, isLoading, isError } = useQuery({
    queryKey: ['destino', destinoId],
    queryFn: () => destinationService.getById(destinoId),
    enabled: !!destinoId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['avaliacoes', destinoId],
    queryFn: () => avaliacaoService.listByDestino(destinoId),
    enabled: !!destinoId,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => bookingService.listMine(),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !destino) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Destino não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const preco = Number(destino.preco_base).toLocaleString('pt-BR');
  const dist = Number(destino.distance_km).toLocaleString('pt-BR');
  const rating = destino.avaliacao?.media ?? 0;
  const totalReviews = reviews.length;
  const highlights = getHighlights(destino.tipo);

  // Real rating distribution from fetched reviews
  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.nota) === star).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, pct };
  });

  // Find an eligible booking: CONCLUIDO for this destination and not yet reviewed
  const reviewedBookingIds = new Set(reviews.map((r) => r.booking_id));
  const eligibleBooking = myBookings.find(
    (b) =>
      b.destino_id === destinoId &&
      b.status === 'CONCLUIDO' &&
      !reviewedBookingIds.has(b.id),
  );
  const canReview = !!eligibleBooking && !reviewed;

  const showRatingsCard = totalReviews > 0 || canReview || reviewed;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Hero image ── */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: destino.image_url }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroTopFade} />
          <View style={styles.heroBotFade} />

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {destino.tipo && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{destino.tipo}</Text>
            </View>
          )}

          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{destino.nome}</Text>
            {rating > 0 && (
              <View style={styles.heroRatingRow}>
                <Stars rating={rating} size={16} />
                <Text style={styles.heroRatingText}>
                  {rating.toFixed(1)} · {destino.avaliacao?.total ?? 0}{' '}
                  {(destino.avaliacao?.total ?? 0) === 1 ? 'avaliação' : 'avaliações'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stat pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatPill icon="navigate-outline" value={`${dist} km`} label="Distância" />
          <StatPill
            icon="people-outline"
            value={`${destino.capacidade_max} pax`}
            label="Capacidade"
            accent={colors.cyan}
          />
          <StatPill
            icon="cash-outline"
            value={`R$ ${preco}`}
            label="Por pessoa"
            accent={colors.success}
          />
          {rating > 0 && (
            <StatPill
              icon="star-outline"
              value={rating.toFixed(1)}
              label="Avaliação"
              accent={colors.gold}
            />
          )}
        </ScrollView>

        <View style={styles.content}>

          {/* ── Sobre a Missão ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Sobre a Missão</Text>
            </View>
            <Text style={styles.desc}>{destino.descricao}</Text>
          </View>

          {/* ── Destaques ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>O que está incluso</Text>
            </View>
            <View style={styles.highlightsList}>
              {highlights.map((h, i) => (
                <View key={i} style={styles.highlightRow}>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={12} color={colors.success} />
                  </View>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Informações de voo ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="rocket-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Informações de Voo</Text>
            </View>
            <View style={styles.infoGrid}>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Tipo de missão</Text>
                <Text style={styles.infoGridValue}>{destino.tipo ?? '—'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Capacidade máx.</Text>
                <Text style={styles.infoGridValue}>{destino.capacidade_max} passageiros</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Distância</Text>
                <Text style={styles.infoGridValue}>{dist} km da Terra</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Preço base/pax</Text>
                <Text style={[styles.infoGridValue, { color: colors.primary }]}>R$ {preco}</Text>
              </View>
            </View>
          </View>

          {/* ── Avaliações ── */}
          {showRatingsCard && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="star-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Avaliação dos Viajantes</Text>
              </View>

              {reviewsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
              ) : totalReviews > 0 ? (
                <>
                  {/* Overview: big number + bars */}
                  <View style={styles.ratingOverview}>
                    <View style={styles.ratingBig}>
                      <Text style={styles.ratingBigNum}>{rating.toFixed(1)}</Text>
                      <Stars rating={rating} size={16} />
                      <Text style={styles.ratingBigSub}>
                        {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
                      </Text>
                    </View>
                    <View style={styles.ratingBars}>
                      {ratingDist.map(({ star, pct, count }) => (
                        <RatingBar key={star} star={star} pct={pct} count={count} />
                      ))}
                    </View>
                  </View>

                  {/* Individual review cards */}
                  <View style={styles.divider} />
                  <View style={styles.reviewsList}>
                    {reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.noReviewsWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.noReviewsTitle}>Sem avaliações ainda</Text>
                  <Text style={styles.noReviewsSubtitle}>
                    {canReview
                      ? 'Você foi o primeiro a concluir essa missão. Compartilhe sua experiência!'
                      : 'Seja o primeiro a explorar e avaliar este destino.'}
                  </Text>
                </View>
              )}

              {/* Review form or success state */}
              {canReview && (
                <>
                  <View style={styles.divider} />
                  <ReviewForm
                    bookingId={eligibleBooking!.id}
                    destinoId={destinoId}
                    onSuccess={() => setReviewed(true)}
                  />
                </>
              )}

              {reviewed && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.successWrap}>
                    <View style={styles.successIcon}>
                      <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                    </View>
                    <Text style={styles.successTitle}>Avaliação publicada!</Text>
                    <Text style={styles.successSub}>
                      Obrigado por compartilhar sua experiência espacial.
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Fixed footer ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Preço por pessoa</Text>
          <Text style={styles.footerPrice}>R$ {preco}</Text>
        </View>
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() => router.push(`/booking-form?destino_id=${destino.id}`)}
          activeOpacity={0.85}
        >
          <Ionicons name="rocket-outline" size={18} color={colors.white} />
          <Text style={styles.reserveText}>Reservar Agora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HERO_H = 360;

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
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    backgroundColor: 'rgba(6,12,24,0.45)',
  },
  heroBotFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
    backgroundColor: 'rgba(6,12,24,0.88)',
  },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(6,12,24,0.65)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  typeBadge: {
    position: 'absolute', top: 52, right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill,
  },
  typeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md, paddingBottom: 20, gap: 8,
  },
  heroName: { color: colors.white, fontSize: fontSize['2xl'], fontWeight: '800', lineHeight: 32 },
  heroRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroRatingText: { color: colors.textSecondary, fontSize: fontSize.sm },

  // Stat pills
  statsRow: { paddingHorizontal: spacing.md, paddingVertical: 16, gap: 10 },
  statPill: {
    alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14,
    paddingVertical: 12, minWidth: 100, gap: 6,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primary + '18', justifyContent: 'center', alignItems: 'center',
  },
  statValue: { color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.sm, textAlign: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },

  // Content
  content: { paddingHorizontal: spacing.md, gap: 14 },

  // Cards
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.primary + '18', justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },

  desc: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 24 },

  highlightsList: { gap: 10 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.success + '20', borderWidth: 1,
    borderColor: colors.success + '40', justifyContent: 'center',
    alignItems: 'center', flexShrink: 0,
  },
  highlightText: { color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 },

  // Info grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoGridItem: {
    width: (SCREEN_W - spacing.md * 2 - spacing.md * 2 - 12) / 2,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 12, gap: 4,
  },
  infoGridLabel: { color: colors.textMuted, fontSize: 11 },
  infoGridValue: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '700' },

  // Rating overview
  ratingOverview: { flexDirection: 'row', gap: 20 },
  ratingBig: { alignItems: 'center', gap: 6, minWidth: 80 },
  ratingBigNum: { color: colors.textPrimary, fontSize: 40, fontWeight: '800', lineHeight: 44 },
  ratingBigSub: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  ratingBars: { flex: 1, gap: 7, justifyContent: 'center' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingBarStar: { color: colors.textMuted, fontSize: 11, width: 9, textAlign: 'right' },
  ratingBarTrack: {
    flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },
  ratingBarCount: { color: colors.textMuted, fontSize: 10, width: 16, textAlign: 'right' },

  // Reviews list
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  reviewsList: { gap: 14 },
  reviewCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10,
  },
  reviewTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  reviewMeta: { flex: 1, gap: 4 },
  reviewNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewName: { color: colors.textPrimary, fontWeight: '600', fontSize: fontSize.sm, flex: 1 },
  reviewDate: { color: colors.textMuted, fontSize: 11 },
  reviewComment: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },

  // No reviews placeholder
  noReviewsWrap: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  noReviewsTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  noReviewsSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },

  // Review form
  reviewForm: { gap: 14 },
  reviewFormHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewFormTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.base },
  reviewFormSubtitle: { color: colors.textMuted, fontSize: fontSize.sm },
  starSelector: { flexDirection: 'row', gap: 10 },
  notaLabel: { color: colors.gold, fontWeight: '600', fontSize: fontSize.sm },
  reviewInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 14, color: colors.textPrimary,
    fontSize: fontSize.sm, minHeight: 90,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },

  // Success state
  successWrap: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  successIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.success + '18', justifyContent: 'center', alignItems: 'center',
  },
  successTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.base },
  successSub: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14, paddingBottom: 28,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerLeft: { gap: 2 },
  footerLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  footerPrice: { color: colors.primary, fontWeight: '800', fontSize: fontSize.xl },
  reserveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 24,
    paddingVertical: 14, borderRadius: radius.md,
  },
  reserveText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
});
