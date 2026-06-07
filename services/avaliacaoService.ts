import { api } from './api';
import type { AvaliacaoItem, CreateAvaliacaoPayload } from './types';

export const avaliacaoService = {
  listByDestino: (destinoId: number): Promise<AvaliacaoItem[]> =>
    api.get<AvaliacaoItem[]>(`/avaliacoes/destino/${destinoId}`),

  create: (payload: CreateAvaliacaoPayload): Promise<AvaliacaoItem> =>
    api.post<AvaliacaoItem>('/avaliacoes/', payload),
};
