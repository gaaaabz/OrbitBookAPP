import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { Destino } from '../services/types';

interface Props {
  destination: Destino;
}

export default function DestinationCard({ destination }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/destination-details?id=${destination.id}`)}
    >
      <Image source={{ uri: destination.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{destination.nome}</Text>

        <Text style={styles.description}>{destination.descricao}</Text>

        <Text style={styles.price}>
          R$ {Number(destination.preco_base).toLocaleString('pt-BR')}
        </Text>

        {destination.avaliacao && destination.avaliacao.total > 0 && (
          <Text style={styles.rating}>
            ⭐ {destination.avaliacao.media.toFixed(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    color: '#D1D5DB',
    marginBottom: 12,
  },
  price: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 16,
  },
  rating: {
    color: '#FBBF24',
    marginTop: 6,
    fontSize: 13,
  },
});
