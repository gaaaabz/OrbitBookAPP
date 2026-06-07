import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { destinationService } from '../../services/destinationService';

export default function DestinationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const destinoId = Number(id);

  const { data: destino, isLoading, isError } = useQuery({
    queryKey: ['destino', destinoId],
    queryFn: () => destinationService.getById(destinoId),
    enabled: !!destinoId,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  if (isError || !destino) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Destino não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: destino.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{destino.nome}</Text>

        <Text style={styles.price}>
          R$ {Number(destino.preco_base).toLocaleString('pt-BR')}
        </Text>

        <Text style={styles.description}>{destino.descricao}</Text>

        <Text style={styles.info}>
          Distância: {Number(destino.distance_km).toLocaleString('pt-BR')} km
        </Text>

        <Text style={styles.info}>
          Capacidade: {destino.capacidade_max} passageiros
        </Text>

        {destino.tipo && (
          <Text style={styles.info}>Tipo: {destino.tipo}</Text>
        )}

        {destino.avaliacao && destino.avaliacao.total > 0 && (
          <Text style={styles.info}>
            Avaliação: ⭐ {destino.avaliacao.media.toFixed(1)} ({destino.avaliacao.total} avaliações)
          </Text>
        )}

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking-form?destino_id=${destino.id}`)}
        >
          <Text style={styles.bookButtonText}>Reservar Agora</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centered: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  price: {
    color: '#60A5FA',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  description: {
    color: '#CBD5E1',
    marginTop: 20,
    lineHeight: 24,
  },
  info: {
    color: '#94A3B8',
    marginTop: 12,
  },
  bookButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    marginBottom: 16,
  },
  backLink: {
    color: '#60A5FA',
  },
});
