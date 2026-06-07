import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { destinationService } from '../../services/destinationService';
import { useAuth } from '../../contexts/AuthContext';
import type { Destino } from '../../services/types';

export default function DestinationsScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: destinations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['destinos'],
    queryFn: () => destinationService.list(),
  });

  const filtered = destinations.filter((item) =>
    item.nome.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = user?.role === 'ADMIN';

  function renderItem({ item }: { item: Destino }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/destination-details?id=${item.id}`)}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.name}>{item.nome}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.descricao}
          </Text>
          <Text style={styles.price}>
            R$ {Number(item.preco_base).toLocaleString('pt-BR')}
          </Text>
          {item.avaliacao && item.avaliacao.total > 0 && (
            <Text style={styles.rating}>
              ⭐ {item.avaliacao.media.toFixed(1)} ({item.avaliacao.total} avaliações)
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar destinos.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Destinos</Text>

      <TextInput
        placeholder="Buscar destino..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-destination')}
        >
          <Text style={styles.addButtonText}>+ Novo Destino</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum destino encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 15,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: '#94A3B8',
    marginTop: 5,
  },
  price: {
    color: '#60A5FA',
    fontWeight: '700',
    marginTop: 10,
  },
  rating: {
    color: '#FBBF24',
    marginTop: 6,
    fontSize: 13,
  },
  errorText: {
    color: '#F87171',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
});
