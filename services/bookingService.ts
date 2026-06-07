import { api } from './api';
import type { Reserva, ReservaCreate, ReservaStatusUpdate } from './types';

export const bookingService = {
  listMine: (): Promise<Reserva[]> =>
    api.get<Reserva[]>('/reservas/'),

  listAll: (): Promise<Reserva[]> =>
    api.get<Reserva[]>('/reservas/todas'),

  getById: (id: number): Promise<Reserva> =>
    api.get<Reserva>(`/reservas/${id}`),

  create: (payload: ReservaCreate): Promise<Reserva> =>
    api.post<Reserva>('/reservas/', payload),

  updateStatus: (id: number, payload: ReservaStatusUpdate): Promise<Reserva> =>
    api.patch<Reserva>(`/reservas/${id}/status`, payload),

  cancel: (id: number): Promise<void> =>
    api.delete(`/reservas/${id}`),
};
