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
} from 'react-native';
import { router } from 'expo-router';
import { aiService } from '../services/aiService';
import type { ChatMessage } from '../services/types';

interface UIMessage extends ChatMessage {
  id: string;
}

const WELCOME: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! Sou a ARIA, assistente de IA do OrbitBook 🚀 Como posso ajudar você a planejar sua viagem espacial?',
};

export default function AssistantScreen() {
  const [messages, setMessages] = useState<UIMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Quais destinos estão disponíveis?',
    'Qual é o mais acessível?',
    'Quais são os requisitos?',
  ]);
  const listRef = useRef<FlatList>(null);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const payload: ChatMessage[] = history
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      const res = await aiService.chat({ messages: payload.length ? payload : [{ role: 'user', content: text.trim() }] });

      const assistantMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.content,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSuggestions(res.suggestions);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível obter resposta da IA.');
    } finally {
      setLoading(false);
    }
  }

  function renderMessage({ item }: { item: UIMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {!isUser && <Text style={styles.ariaLabel}>ARIA</Text>}
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
          {item.content}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>ARIA</Text>
          <Text style={styles.headerSubtitle}>Assistente OrbitBook</Text>
        </View>
        <View style={styles.statusDot} />
      </View>

      {/* Mensagens */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Sugestões */}
      {suggestions.length > 0 && !loading && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text style={styles.loadingText}>ARIA está pensando...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Pergunte sobre destinos, preços..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={() => sendMessage(input)}
          returnKeyType="send"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: '#60A5FA',
    fontSize: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginLeft: 'auto',
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  ariaLabel: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextAssistant: {
    color: '#E2E8F0',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  suggestionText: {
    color: '#60A5FA',
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1E293B',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
