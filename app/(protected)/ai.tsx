import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../../services/aiService';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import type { ChatMessage, Destino } from '../../services/types';

const { width: SCREEN_W } = Dimensions.get('window');

interface UIMessage extends ChatMessage {
  id: string;
  destinos?: Destino[];
}

const WELCOME: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá! Sou a ARIA, sua assistente de viagens espaciais. Posso recomendar destinos, ajudar a planejar sua missão e responder qualquer dúvida sobre o OrbitBook. Por onde quer começar?',
};

const INITIAL_SUGGESTIONS = [
  'Destinos mais acessíveis',
  'Missões lunares disponíveis',
  'Opções para 2 passageiros',
];

// ── Recommendation card inline ────────────────────────────
function DestinationRec({ destination }: { destination: Destino }) {
  const preco = Number(destination.preco_base).toLocaleString('pt-BR');
  return (
    <TouchableOpacity
      style={styles.recCard}
      onPress={() => router.push(`/destination-details?id=${destination.id}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: destination.image_url }} style={styles.recImage} resizeMode="cover" />
      <View style={styles.recOverlay} />
      {destination.tipo && (
        <View style={styles.recBadge}>
          <Text style={styles.recBadgeText}>{destination.tipo}</Text>
        </View>
      )}
      <View style={styles.recInfo}>
        <Text style={styles.recName} numberOfLines={1}>
          {destination.nome}
        </Text>
        <View style={styles.recBottom}>
          <View style={styles.recMeta}>
            {destination.avaliacao && destination.avaliacao.total > 0 && (
              <View style={styles.recRating}>
                <Ionicons name="star" size={11} color={colors.gold} />
                <Text style={styles.recRatingText}>
                  {destination.avaliacao.media.toFixed(1)}
                </Text>
              </View>
            )}
            <Text style={styles.recDist}>
              {Number(destination.distance_km).toLocaleString('pt-BR')} km
            </Text>
          </View>
          <Text style={styles.recPrice}>R$ {preco}</Text>
        </View>
        <View style={styles.recCta}>
          <Text style={styles.recCtaText}>Ver destino</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Message bubble ────────────────────────────────────────
function MessageBubble({ item }: { item: UIMessage }) {
  const isUser = item.role === 'user';

  if (isUser) {
    return (
      <View style={styles.rowUser}>
        <View style={styles.bubbleUser}>
          <Text style={styles.textUser}>{item.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowAI}>
      <View style={styles.ariaAvatarSm}>
        <Ionicons name="sparkles" size={12} color={colors.primary} />
      </View>
      <View style={styles.bubbleCol}>
        <View style={styles.bubbleAI}>
          <Text style={styles.textAI}>{item.content}</Text>
        </View>
        {item.destinos && item.destinos.length > 0 && (
          <View style={styles.recsSection}>
            <Text style={styles.recsLabel}>Destinos recomendados</Text>
            {item.destinos.map((d) => (
              <DestinationRec key={d.id} destination={d} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────
export default function AIScreen() {
  const [messages, setMessages] = useState<UIMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const listRef = useRef<FlatList>(null);

  function scrollToEnd() {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    scrollToEnd();

    try {
      const payload: ChatMessage[] = next
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      const res = await aiService.chat({
        messages: payload.length ? payload : [{ role: 'user', content: trimmed }],
      });

      const aiMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.content,
        destinos: res.destinos_recomendados ?? [],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setSuggestions(res.suggestions ?? []);
      scrollToEnd();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha na conexão com ARIA.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.ariaAvatarLg}>
          <Ionicons name="sparkles" size={20} color={colors.white} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>ARIA</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Assistente espacial</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble item={item} />}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.ariaAvatarSm}>
            <Ionicons name="sparkles" size={12} color={colors.primary} />
          </View>
          <View style={[styles.bubbleAI, styles.typingBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>Pensando...</Text>
          </View>
        </View>
      )}

      {/* Suggestion chips */}
      {suggestions.length > 0 && !loading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.chip} onPress={() => send(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Pergunte sobre destinos, preços, requisitos..."
          placeholderTextColor={colors.placeholder}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const REC_CARD_H = 160;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ariaAvatarLg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: { color: colors.textSecondary, fontSize: fontSize.xs },

  // Messages list
  msgList: { padding: spacing.md, gap: 16, paddingBottom: 8 },

  // AI message row
  rowAI: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  ariaAvatarSm: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  bubbleCol: { flex: 1, gap: 10 },
  bubbleAI: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  textAI: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: 22,
  },

  // User message row
  rowUser: { flexDirection: 'row', justifyContent: 'flex-end' },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    maxWidth: '82%',
  },
  textUser: {
    color: colors.white,
    fontSize: fontSize.base,
    lineHeight: 22,
  },

  // Recommendations
  recsSection: { gap: 10 },
  recsLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  recCard: {
    height: REC_CARD_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  recImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  recOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,12,24,0.62)',
  },
  recBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary + 'CC',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
  recInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  recName: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 6,
  },
  recBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  recRatingText: { color: colors.gold, fontSize: fontSize.xs, fontWeight: '700' },
  recDist: { color: colors.textSecondary, fontSize: fontSize.xs },
  recPrice: { color: colors.primaryLight, fontSize: fontSize.base, fontWeight: '800' },
  recCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  recCtaText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  typingText: { color: colors.textMuted, fontSize: fontSize.sm },

  // Suggestion chips
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  chipText: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnOff: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
