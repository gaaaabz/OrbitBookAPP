import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../services/bookingService';
import { destinationService } from '../../services/destinationService';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, radius, fontSize, statusColor, statusLabel } from '../../constants/theme';
import type { Reserva, Destino } from '../../services/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function BookingCard({
  item,
  destino,
  onCancel,
  canceling,
  onPress,
}: {
  item: Reserva;
  destino?: Destino;
  onCancel: () => void;
  canceling: boolean;
  onPress: () => void;
}) {
  const key = item.status ?? 'PENDENTE';
  const sColor = statusColor[key] ?? colors.textMuted;
  const sLabel = statusLabel[key] ?? key;
  const canCancel = key === 'PENDENTE' || key === 'CONFIRMADO';
  const preco = Number(item.valor_total).toLocaleString('pt-BR');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* colored left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: sColor }]} />

      <View style={styles.cardBody}>
        {/* destination name + status */}
        <View style={styles.topRow}>
          <Text style={styles.cardDestino} numberOfLines={1}>
            {destino ? destino.nome : `Reserva #${item.id}`}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: sColor + '22', borderColor: sColor + '55' }]}>
            <Text style={[styles.statusText, { color: sColor }]}>{sLabel}</Text>
          </View>
        </View>

        {/* dates */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {formatDate(item.departure_date)} → {formatDate(item.return_date)}
          </Text>
        </View>

        {/* passengers + price */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.num_passageiros} passageiro(s)</Text>
          </View>
          <Text style={[styles.price, { color: sColor === colors.textMuted ? colors.primary : sColor }]}>
            R$ {preco}
          </Text>
        </View>

        {/* cancel */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            disabled={canceling}
            activeOpacity={0.7}
          >
            {canceling ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={15} color={colors.danger} />
                <Text style={styles.cancelText}>Cancelar reserva</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* chevron */}
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => bookingService.listMine(),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinos-all'],
    queryFn: () => destinationService.listAll(),
    staleTime: 5 * 60 * 1000,
  });

  const destinoMap = new Map<number, Destino>(destinations.map((d) => [d.id, d]));

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
    onError: (err) =>
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível cancelar.'),
  });

  function confirmCancel(id: number) {
    Alert.alert(
      'Cancelar reserva',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Cancelar reserva', style: 'destructive', onPress: () => cancelMutation.mutate(id) },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Reservas</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Reservas</Text>
        <Text style={styles.subtitle}>
          {bookings.length} {bookings.length === 1 ? 'reserva' : 'reservas'}
        </Text>
      </View>

      {isError ? (
        <EmptyState
          icon="wifi-outline"
          title="Erro ao carregar reservas"
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              destino={destinoMap.get(item.destino_id)}
              onCancel={() => confirmCancel(item.id)}
              canceling={cancelMutation.isPending && cancelMutation.variables === item.id}
              onPress={() => router.push(`/booking-detail?id=${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Nenhuma reserva ainda"
              subtitle="Explore os destinos e faça sua primeira reserva espacial!"
              actionLabel="Explorar destinos"
              onAction={() => router.push('/destinations')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  newBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },

  list: { padding: spacing.md, gap: 12, paddingBottom: 90 },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accentBar: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 8 },
  chevronWrap: {
    justifyContent: 'center',
    paddingRight: 14,
    paddingLeft: 6,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardDestino: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '700',
    flex: 1,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.textSecondary, fontSize: fontSize.sm },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { fontWeight: '700', fontSize: fontSize.base },

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: '600' },
});
