import { api } from './api';
import type { Destino, DestinoCreate, DestinoUpdate, DestinoPage } from './types';

export interface ListDestinosParams {
  tipo?: string;
  preco_min?: number;
  preco_max?: number;
  busca?: string;
  page?: number;
  limit?: number;
}

function buildQuery(params: ListDestinosParams): string {
  const q = new URLSearchParams();
  if (params.tipo) q.set('tipo', params.tipo);
  if (params.preco_min !== undefined) q.set('preco_min', String(params.preco_min));
  if (params.preco_max !== undefined) q.set('preco_max', String(params.preco_max));
  if (params.busca) q.set('busca', params.busca);
  if (params.page !== undefined) q.set('page', String(params.page));
  if (params.limit !== undefined) q.set('limit', String(params.limit));
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

export const destinationService = {
  list: (params: ListDestinosParams = {}): Promise<DestinoPage> =>
    api.get<DestinoPage>(`/destinos/${buildQuery(params)}`),

  listAll: (): Promise<Destino[]> =>
    api.get<DestinoPage>('/destinos/?limit=50&page=1').then((p) => p.items),

  getById: (id: number): Promise<Destino> =>
    api.get<Destino>(`/destinos/${id}`),

  create: (payload: DestinoCreate): Promise<Destino> =>
    api.post<Destino>('/destinos/', payload),

  update: (id: number, payload: DestinoUpdate): Promise<Destino> =>
    api.patch<Destino>(`/destinos/${id}`, payload),

  remove: (id: number): Promise<void> =>
    api.delete(`/destinos/${id}`),
};
