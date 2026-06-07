import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { destinationService } from '../../services/destinationService';
import type { Reserva, Destino } from '../../services/types';

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmada',
  EM_MISSAO: 'Em Missão',
  CONCLUIDO: 'Concluída',
  CANCELADO: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: '#FBBF24',
  CONFIRMADO: '#34D399',
  EM_MISSAO: '#60A5FA',
  CONCLUIDO: '#A78BFA',
  CANCELADO: '#F87171',
};

export default function BookingsScreen() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => bookingService.listMine(),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinos'],
    queryFn: () => destinationService.list(),
  });

  const destinoMap = new Map<number, Destino>(
    destinations.map((d) => [d.id, d])
  );

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
    onError: (error) =>
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível cancelar.'),
  });

  function confirmCancel(id: number) {
    Alert.alert(
      'Cancelar Reserva',
      'Tem certeza que deseja cancelar esta reserva?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: () => cancelMutation.mutate(id) },
      ]
    );
  }

  function renderItem({ item }: { item: Reserva }) {
    const statusKey = item.status ?? 'PENDENTE';
    const canCancel = statusKey === 'PENDENTE' || statusKey === 'CONFIRMADO';
    const destino = destinoMap.get(item.destino_id);

    return (
      <View style={styles.card}>
        <Text style={styles.destination}>
          {destino ? destino.nome : `Destino #${item.destino_id}`}
        </Text>

        <Text style={styles.info}>
          Saída: {new Date(item.departure_date).toLocaleDateString('pt-BR')}
        </Text>

        <Text style={styles.info}>
          Retorno: {new Date(item.return_date).toLocaleDateString('pt-BR')}
        </Text>

        <Text style={styles.info}>
          Passageiros: {item.num_passageiros}
        </Text>

        <Text style={[styles.status, { color: STATUS_COLOR[statusKey] ?? '#94A3B8' }]}>
          {STATUS_LABEL[statusKey] ?? statusKey}
        </Text>

        <Text style={styles.price}>
          R$ {Number(item.valor_total).toLocaleString('pt-BR')}
        </Text>

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => confirmCancel(item.id)}
            disabled={cancelMutation.isPending}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
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
        <Text style={styles.errorText}>Erro ao carregar reservas.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Reservas</Text>

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => router.push('/destinations')}
      >
        <Text style={styles.newButtonText}>+ Nova Reserva</Text>
      </TouchableOpacity>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você ainda não tem reservas.</Text>
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
  newButton: {
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  destination: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    color: '#94A3B8',
    marginTop: 5,
  },
  status: {
    fontWeight: '700',
    marginTop: 8,
  },
  price: {
    color: '#60A5FA',
    fontWeight: '700',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
