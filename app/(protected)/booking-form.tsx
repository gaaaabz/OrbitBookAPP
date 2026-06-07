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
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { destinationService } from '../../services/destinationService';

function parseDateBR(value: string): string | null {
  // Aceita DD/MM/YYYY e converte para YYYY-MM-DD
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

export default function BookingFormScreen() {
  const { destino_id } = useLocalSearchParams<{ destino_id: string }>();
  const qc = useQueryClient();

  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  const destinoId = Number(destino_id);

  const { data: destino } = useQuery({
    queryKey: ['destino', destinoId],
    queryFn: () => destinationService.getById(destinoId),
    enabled: !!destinoId,
  });

  const mutation = useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas'] });
      Alert.alert('Sucesso', 'Reserva criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/bookings') },
      ]);
    },
    onError: (error) =>
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível criar a reserva.'),
  });

  const handleSave = () => {
    if (!destinoId) {
      Alert.alert('Atenção', 'Nenhum destino selecionado. Escolha um destino antes de reservar.');
      return;
    }

    const dep = parseDateBR(departureDate);
    const ret = parseDateBR(returnDate);
    const numPassengers = parseInt(passengers, 10);

    if (!dep) {
      Alert.alert('Atenção', 'Data de ida inválida. Use o formato DD/MM/AAAA.');
      return;
    }
    if (!ret) {
      Alert.alert('Atenção', 'Data de retorno inválida. Use o formato DD/MM/AAAA.');
      return;
    }
    if (isNaN(numPassengers) || numPassengers < 1) {
      Alert.alert('Atenção', 'Informe ao menos 1 passageiro.');
      return;
    }
    if (new Date(dep) >= new Date(ret)) {
      Alert.alert('Atenção', 'A data de retorno deve ser posterior à data de ida.');
      return;
    }

    mutation.mutate({
      destino_id: destinoId,
      departure_date: dep,
      return_date: ret,
      num_passageiros: numPassengers,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Nova Reserva</Text>

      {destino && (
        <View style={styles.destinoCard}>
          <Text style={styles.destinoLabel}>Destino</Text>
          <Text style={styles.destinoName}>{destino.nome}</Text>
          <Text style={styles.destinoPrice}>
            R$ {Number(destino.preco_base).toLocaleString('pt-BR')} / pessoa
          </Text>
        </View>
      )}

      <Text style={styles.label}>Data de ida (DD/MM/AAAA)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 15/07/2027"
        placeholderTextColor="#94A3B8"
        value={departureDate}
        onChangeText={setDepartureDate}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Data de retorno (DD/MM/AAAA)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 25/07/2027"
        placeholderTextColor="#94A3B8"
        value={returnDate}
        onChangeText={setReturnDate}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Quantidade de passageiros</Text>
      <TextInput
        style={styles.input}
        placeholder="1"
        placeholderTextColor="#94A3B8"
        value={passengers}
        onChangeText={setPassengers}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Confirmar Reserva</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  destinoCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  destinoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  destinoName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  destinoPrice: {
    color: '#60A5FA',
    marginTop: 4,
    fontWeight: '600',
  },
  label: {
    color: '#94A3B8',
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
