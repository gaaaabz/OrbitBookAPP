import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../constants/theme';
import type { Destino } from '../services/types';

interface Props {
  destination: Destino;
}

export default function DestinationCard({ destination }: Props) {
  const router = useRouter();
  const preco = Number(destination.preco_base).toLocaleString('pt-BR');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/destination-details?id=${destination.id}`)}
      activeOpacity={0.85}
    >
      {/* Imagem quadrada à esquerda */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: destination.image_url }} style={styles.image} resizeMode="cover" />
        {destination.tipo && (
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoText}>{destination.tipo}</Text>
          </View>
        )}
      </View>

      {/* Info à direita */}
      <View style={styles.info}>
        {/* Nome + rating */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{destination.nome}</Text>
          {destination.avaliacao && destination.avaliacao.total > 0 && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color={colors.gold} />
              <Text style={styles.ratingText}>{destination.avaliacao.media.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Meta: distância + capacidade */}
        <View style={styles.metaRow}>
          <Ionicons name="navigate-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{Number(destination.distance_km).toLocaleString('pt-BR')} km</Text>
          <View style={styles.dot} />
          <Ionicons name="people-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>até {destination.capacidade_max} pax</Text>
        </View>

        {/* Preço + CTA */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.fromLabel}>a partir de</Text>
            <Text style={styles.price}>R$ {preco}</Text>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Ver missão</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    height: 112,
  },

  imageWrap: {
    width: 108,
    height: '100%',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  tipoBadge: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    backgroundColor: colors.primary + 'DD',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tipoText: { color: colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  info: {
    flex: 1,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: 19,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.gold + '18',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.gold + '35',
    flexShrink: 0,
  },
  ratingText: { color: colors.gold, fontSize: 11, fontWeight: '700' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { color: colors.textMuted, fontSize: 11 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 2,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  fromLabel: { color: colors.textMuted, fontSize: 10 },
  price: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ctaText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
