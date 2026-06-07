import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { destinationService } from '../../services/destinationService';
import { useAuth } from '../../contexts/AuthContext';
import DestinationCard from '../../components/DestinationCard';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import type { Destino, DestinoPage } from '../../services/types';

const { width: SCREEN_W } = Dimensions.get('window');
const FEATURED_W = SCREEN_W * 0.72;
const FEATURED_H = 210;

const CATEGORIAS = [
  { key: 'Todos', label: 'Todos', icon: 'layers-outline' as const },
  { key: 'ORBITAL', label: 'Orbital', icon: 'radio-button-on-outline' as const },
  { key: 'LUNAR', label: 'Lunar', icon: 'moon-outline' as const },
  { key: 'MARCIANO', label: 'Marciano', icon: 'planet-outline' as const },
  { key: 'SUBORBITAL', label: 'Suborbital', icon: 'rocket-outline' as const },
  { key: 'ASTEROIDE', label: 'Asteroide', icon: 'remove-circle-outline' as const },
];

function FeaturedCard({ destination, onPress }: { destination: Destino; onPress: () => void }) {
  const preco = Number(destination.preco_base).toLocaleString('pt-BR');
  return (
    <TouchableOpacity style={styles.featCard} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: destination.image_url }} style={styles.featImage} resizeMode="cover" />
      <View style={styles.featGrad} />
      {destination.tipo && (
        <View style={styles.featBadge}>
          <Text style={styles.featBadgeText}>{destination.tipo}</Text>
        </View>
      )}
      {destination.avaliacao && destination.avaliacao.total > 0 && (
        <View style={styles.featRating}>
          <Ionicons name="star" size={11} color={colors.gold} />
          <Text style={styles.featRatingText}>{destination.avaliacao.media.toFixed(1)}</Text>
        </View>
      )}
      <View style={styles.featInfo}>
        <Text style={styles.featName} numberOfLines={1}>{destination.nome}</Text>
        <View style={styles.featRow}>
          <View style={styles.featDistRow}>
            <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.featDist}>
              {Number(destination.distance_km).toLocaleString('pt-BR')} km
            </Text>
          </View>
          <View>
            <Text style={styles.featFrom}>a partir de</Text>
            <Text style={styles.featPrice}>R$ {preco}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DestinationsScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 420);
    return () => clearTimeout(t);
  }, [search]);

  const catFilter = categoria !== 'Todos' ? categoria : undefined;

  // Featured: first 6, no filter
  const { data: featuredPage } = useQuery({
    queryKey: ['destinos-featured'],
    queryFn: () => destinationService.list({ page: 1, limit: 6 }),
    staleTime: 5 * 60 * 1000,
  });
  const featured = featuredPage?.items ?? [];

  // Main paginated list
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['destinos', catFilter, debouncedSearch],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      destinationService.list({
        tipo: catFilter,
        busca: debouncedSearch || undefined,
        page: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage: DestinoPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const destinations = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  const isAdmin = user?.role === 'ADMIN';
  const firstName = user?.nome?.split(' ')[0] ?? 'Viajante';
  const hasFilters = debouncedSearch.length > 0 || categoria !== 'Todos';

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategoria('Todos');
  }, []);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function renderHeader() {
    return (
      <>
        {/* ── App Header ── */}
        <View style={styles.appHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá, {firstName}</Text>
            <Text style={styles.headerTitle}>Para onde vamos?</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-destination')}>
              <Ionicons name="add" size={22} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={searchFocused ? colors.primary : colors.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar missões..."
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Em Destaque</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featured}
              keyExtractor={(item) => `feat-${item.id}`}
              contentContainerStyle={styles.featList}
              snapToInterval={FEATURED_W + 12}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <FeaturedCard
                  destination={item}
                  onPress={() => router.push(`/destination-details?id=${item.id}`)}
                />
              )}
            />
          </View>
        )}

        {/* ── Categories ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catContent}
          >
            {CATEGORIAS.map((cat) => {
              const isActive = categoria === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catChip, isActive && styles.catChipActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategoria(cat.key);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Count row ── */}
        <View style={styles.countRow}>
          {isLoading ? (
            <Text style={styles.countText}>Buscando...</Text>
          ) : (
            <Text style={styles.countText}>
              {totalCount} {totalCount === 1 ? 'destino encontrado' : 'destinos encontrados'}
            </Text>
          )}
          {hasFilters && !isLoading && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <View style={styles.root}>
        {renderHeader()}
        <EmptyState
          icon="wifi-outline"
          title="Erro de conexão"
          subtitle="Não foi possível carregar os destinos."
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={isLoading ? [] : destinations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DestinationCard destination={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando missões...</Text>
            </View>
          ) : isFetchingNextPage ? (
            <View style={styles.loadMoreBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadMoreText}>Carregando mais...</Text>
            </View>
          ) : hasNextPage ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => fetchNextPage()}>
              <Text style={styles.loadMoreBtnText}>Carregar mais missões</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : destinations.length > 0 ? (
            <Text style={styles.endText}>Todas as missões carregadas</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="planet-outline"
              title="Nenhum destino encontrado"
              subtitle="Tente outro termo ou categoria"
              actionLabel="Limpar filtros"
              onAction={clearFilters}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flex: 1 },
  greeting: { color: colors.textSecondary, fontSize: fontSize.sm },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '800',
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: colors.surface,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchRowFocused: { borderColor: colors.primary },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },

  section: { paddingTop: 22 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: 13,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  seeAll: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: 12,
  },

  featList: { paddingHorizontal: spacing.md, gap: 12 },
  featCard: {
    width: FEATURED_W,
    height: FEATURED_H,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featImage: { width: '100%', height: '100%' },
  featGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,12,24,0.72)',
    top: '38%',
  },
  featBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary + 'CC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  featBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
  featRating: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6,12,24,0.72)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gold + '40',
  },
  featRatingText: { color: colors.gold, fontSize: fontSize.xs, fontWeight: '700' },
  featInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  featName: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800', marginBottom: 8 },
  featRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  featDistRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featDist: { color: colors.textSecondary, fontSize: fontSize.xs },
  featFrom: { color: colors.textMuted, fontSize: 10, textAlign: 'right' },
  featPrice: { color: colors.primaryLight, fontSize: fontSize.sm, fontWeight: '800' },

  catContent: { paddingHorizontal: spacing.md, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  catChipActive: { backgroundColor: colors.primary + '18', borderColor: colors.primary },
  catLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  catLabelActive: { color: colors.primary, fontWeight: '700' },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 18,
    paddingBottom: 8,
  },
  countText: { color: colors.textMuted, fontSize: fontSize.sm },
  clearText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },

  list: { paddingHorizontal: spacing.md, gap: 10, paddingBottom: 100 },

  loadingBox: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: colors.textMuted, fontSize: fontSize.sm },
  loadMoreBox: { paddingVertical: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  loadMoreText: { color: colors.textMuted, fontSize: fontSize.sm },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 16,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  endText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    paddingVertical: 20,
  },
});
