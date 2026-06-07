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
import { destinationService } from '../../services/destinationService';

const TIPOS_DISPONIVEIS = ['ORBITAL', 'LUNAR', 'MARCIANO', 'SUBORBITAL', 'ASTEROIDE'];

export default function AddDestinationScreen() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [tipo, setTipo] = useState('');
  const [description, setDescription] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const mutation = useMutation({
    mutationFn: destinationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['destinos'] });
      Alert.alert('Sucesso', 'Destino cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) =>
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível salvar.'),
  });

  const handleSave = () => {
    if (!name.trim() || !tipo.trim() || !description.trim() || !distanceKm || !basePrice || !capacity || !imageUrl.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const distKm = parseFloat(distanceKm);
    const price = parseFloat(basePrice);
    const cap = parseInt(capacity, 10);

    if (isNaN(distKm) || isNaN(price) || isNaN(cap)) {
      Alert.alert('Atenção', 'Distância, preço e capacidade devem ser números válidos.');
      return;
    }

    mutation.mutate({
      nome: name.trim(),
      tipo: tipo.trim().toUpperCase(),
      descricao: description.trim(),
      distance_km: distKm,
      preco_base: price,
      capacidade_max: cap,
      image_url: imageUrl.trim(),
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Novo Destino</Text>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Tipo (ex: {TIPOS_DISPONIVEIS.join(', ')})
      </Text>
      <TextInput
        placeholder="Ex: ORBITAL"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={tipo}
        onChangeText={setTipo}
        autoCapitalize="characters"
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#94A3B8"
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        placeholder="Distância (km)"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={distanceKm}
        onChangeText={setDistanceKm}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Preço base (R$)"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={basePrice}
        onChangeText={setBasePrice}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Capacidade máxima"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="URL da Imagem"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Salvar Destino</Text>
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
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
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
  },
});
