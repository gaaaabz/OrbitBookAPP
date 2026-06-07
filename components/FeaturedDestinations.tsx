import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import DestinationCard from './DestinationCard';
import { destinationService } from '../services/destinationService';

export default function FeaturedDestinations() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['destinos-featured'],
    queryFn: () => destinationService.list({ page: 1, limit: 4 }),
  });

  const featured = data?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Destinos em Destaque</Text>
          <Text style={styles.subtitle}>
            As experiências mais populares do catálogo.
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/destinations')}>
          <Text style={styles.link}>Ver Todos →</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator color="#60A5FA" style={{ marginTop: 20 }} />
      )}

      {isError && (
        <Text style={styles.errorText}>Não foi possível carregar os destinos.</Text>
      )}

      <View style={styles.cardsContainer}>
        {featured.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  link: {
    marginTop: 12,
    color: '#60A5FA',
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
  },
  errorText: {
    color: '#F87171',
    marginTop: 12,
  },
});
