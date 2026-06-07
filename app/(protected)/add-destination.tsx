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
} from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { destinationService } from '../../services/destinationService';
import { colors, spacing, radius, fontSize } from '../../constants/theme';

const TIPOS = ['ORBITAL', 'LUNAR', 'MARCIANO', 'SUBORBITAL', 'ASTEROIDE'];

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon} size={14} color={colors.textMuted} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {children}
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

export default function AddDestinationScreen() {
  const qc = useQueryClient();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [precoBase, setPrecoBase] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const mutation = useMutation({
    mutationFn: destinationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['destinos'] });
      Alert.alert('Destino cadastrado!', 'O novo destino já está disponível.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err) =>
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível salvar.'),
  });

  const handleSave = () => {
    if (!nome.trim() || !tipo || !descricao.trim() || !distanceKm || !precoBase || !capacidade || !imageUrl.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    const dist = parseFloat(distanceKm);
    const preco = parseFloat(precoBase);
    const cap = parseInt(capacidade, 10);
    if (isNaN(dist) || isNaN(preco) || isNaN(cap) || cap < 1 || preco <= 0) {
      Alert.alert('Atenção', 'Valores numéricos inválidos.');
      return;
    }
    mutation.mutate({
      nome: nome.trim(),
      tipo: tipo.toUpperCase(),
      descricao: descricao.trim(),
      distance_km: dist,
      preco_base: preco,
      capacidade_max: cap,
      image_url: imageUrl.trim(),
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Destino</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.adminBanner}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.warning} />
          <Text style={styles.adminText}>Área exclusiva para administradores</Text>
        </View>

        <Field label="Nome do destino" icon="flag-outline">
          <TextInput
            style={styles.input}
            placeholder="Ex: Estação Orbital Alpha"
            placeholderTextColor={colors.placeholder}
            value={nome}
            onChangeText={setNome}
          />
        </Field>

        <Field label="Tipo" icon="layers-outline" hint={`Opções: ${TIPOS.join(', ')}`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipoScroll} contentContainerStyle={styles.tipoContent}>
            {TIPOS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tipoChip, tipo === t && styles.tipoChipActive]}
                onPress={() => setTipo(t)}
              >
                <Text style={[styles.tipoText, tipo === t && styles.tipoTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>

        <Field label="Descrição" icon="document-text-outline">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Descreva a missão, o que está incluso, experiência..."
            placeholderTextColor={colors.placeholder}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Distância (km)" icon="navigate-outline">
              <TextInput style={styles.input} placeholder="400" placeholderTextColor={colors.placeholder} value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Capacidade" icon="people-outline">
              <TextInput style={styles.input} placeholder="20" placeholderTextColor={colors.placeholder} value={capacidade} onChangeText={setCapacidade} keyboardType="numeric" />
            </Field>
          </View>
        </View>

        <Field label="Preço base (R$)" icon="cash-outline">
          <TextInput
            style={styles.input}
            placeholder="250000"
            placeholderTextColor={colors.placeholder}
            value={precoBase}
            onChangeText={setPrecoBase}
            keyboardType="numeric"
          />
        </Field>

        <Field label="URL da imagem" icon="image-outline" hint="Use uma URL pública de imagem">
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={colors.placeholder}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Field>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? <ActivityIndicator color={colors.white} />
            : (
              <View style={styles.saveBtnContent}>
                <Text style={styles.saveBtnText}>Salvar Destino</Text>
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
  scroll: { padding: spacing.md },

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

  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 24,
  },
  adminText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '600' },

  field: { marginBottom: 20 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  fieldHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 6 },

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
  textarea: { height: 100, paddingTop: 13 },

  row: { flexDirection: 'row', gap: 12 },

  tipoScroll: { flexGrow: 0 },
  tipoContent: { gap: 8 },
  tipoChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipoChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tipoText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  tipoTextActive: { color: colors.white },

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
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
});
