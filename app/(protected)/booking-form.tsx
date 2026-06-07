import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../services/bookingService';
import { destinationService } from '../../services/destinationService';
import { colors, spacing, radius, fontSize } from '../../constants/theme';

function parseDateBR(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        <Ionicons name={icon} size={13} color={colors.textMuted} /> {label}
      </Text>
      {children}
    </View>
  );
}

export default function BookingFormScreen() {
  const { destino_id } = useLocalSearchParams<{ destino_id: string }>();
  const qc = useQueryClient();
  const destinoId = Number(destino_id);

  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  const { data: destino } = useQuery({
    queryKey: ['destino', destinoId],
    queryFn: () => destinationService.getById(destinoId),
    enabled: !!destinoId,
  });

  const mutation = useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] });
      Alert.alert('Reserva criada! 🚀', 'Sua reserva foi registrada com sucesso.', [
        { text: 'Ver reservas', onPress: () => router.replace('/bookings') },
      ]);
    },
    onError: (err) =>
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível criar a reserva.'),
  });

  const handleSave = () => {
    if (!destinoId) {
      Alert.alert('Atenção', 'Nenhum destino selecionado.');
      return;
    }
    const dep = parseDateBR(departureDate);
    const ret = parseDateBR(returnDate);
    const num = parseInt(passengers, 10);

    if (!dep) { Alert.alert('Atenção', 'Data de ida inválida. Use DD/MM/AAAA.'); return; }
    if (!ret) { Alert.alert('Atenção', 'Data de retorno inválida. Use DD/MM/AAAA.'); return; }
    if (isNaN(num) || num < 1) { Alert.alert('Atenção', 'Informe ao menos 1 passageiro.'); return; }
    if (new Date(dep) >= new Date(ret)) { Alert.alert('Atenção', 'O retorno deve ser após a ida.'); return; }
    if (new Date(dep) <= new Date()) { Alert.alert('Atenção', 'A data de ida deve ser futura.'); return; }

    mutation.mutate({ destino_id: destinoId, departure_date: dep, return_date: ret, num_passageiros: num });
  };

  const total = destino && !isNaN(parseInt(passengers))
    ? (Number(destino.preco_base) * parseInt(passengers)).toLocaleString('pt-BR')
    : '—';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Reserva</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Card do destino */}
        {destino && (
          <View style={styles.destinoCard}>
            <Image source={{ uri: destino.image_url }} style={styles.destinoImg} resizeMode="cover" />
            <View style={styles.destinoOverlay} />
            <View style={styles.destinoInfo}>
              <View style={styles.tipoBadge}>
                <Text style={styles.tipoText}>{destino.tipo ?? 'DESTINO'}</Text>
              </View>
              <Text style={styles.destinoNome}>{destino.nome}</Text>
              <Text style={styles.destinoPreco}>
                R$ {Number(destino.preco_base).toLocaleString('pt-BR')} / pessoa
              </Text>
            </View>
          </View>
        )}

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Detalhes da Viagem</Text>

          <View style={styles.datesRow}>
            <View style={{ flex: 1 }}>
              <FormField label="Data de ida" icon="calendar-outline">
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.placeholder}
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  keyboardType="numeric"
                />
              </FormField>
            </View>
            <View style={styles.dateSep}>
              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Data de retorno" icon="calendar-outline">
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.placeholder}
                  value={returnDate}
                  onChangeText={setReturnDate}
                  keyboardType="numeric"
                />
              </FormField>
            </View>
          </View>

          <FormField label="Passageiros" icon="people-outline">
            <View style={styles.passRow}>
              <TouchableOpacity
                style={styles.passBtn}
                onPress={() => setPassengers((p) => String(Math.max(1, parseInt(p) - 1)))}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TextInput
                style={styles.passInput}
                value={passengers}
                onChangeText={(v) => setPassengers(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.passBtn}
                onPress={() => {
                  const max = destino?.capacidade_max ?? 99;
                  setPassengers((p) => String(Math.min(max, parseInt(p) + 1)));
                }}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </FormField>
        </View>

        {/* Resumo */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Destino</Text>
              <Text style={styles.summaryValue}>{destino?.nome ?? '—'}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Passageiros</Text>
              <Text style={styles.summaryValue}>{passengers}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Preço / pessoa</Text>
              <Text style={styles.summaryValue}>
                R$ {destino ? Number(destino.preco_base).toLocaleString('pt-BR') : '—'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: '700', color: colors.textPrimary }]}>Total</Text>
              <Text style={styles.totalValue}>R$ {total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, mutation.isPending && styles.confirmBtnDisabled]}
          onPress={handleSave}
          disabled={mutation.isPending}
          activeOpacity={0.85}
        >
          {mutation.isPending
            ? <ActivityIndicator color={colors.white} />
            : (
              <View style={styles.confirmContent}>
                <Text style={styles.confirmText}>Confirmar Reserva</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              </View>
            )
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },

  destinoCard: { height: 180, position: 'relative' },
  destinoImg: { width: '100%', height: '100%' },
  destinoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,12,24,0.55)' },
  destinoInfo: { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 4 },
  tipoBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  tipoText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
  destinoNome: { color: colors.white, fontSize: fontSize.xl, fontWeight: '800' },
  destinoPreco: { color: colors.primaryLight, fontSize: fontSize.sm },

  form: { padding: spacing.md },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  datesRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  dateSep: { paddingBottom: 12, paddingHorizontal: 4 },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: fontSize.base,
  },

  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  passBtn: {
    padding: 13,
    backgroundColor: colors.cardAlt,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passInput: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    paddingVertical: 12,
  },

  summary: { paddingHorizontal: spacing.md, paddingBottom: 16 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: fontSize.sm },
  summaryValue: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: colors.border },
  totalValue: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.55 },
  confirmContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
});
