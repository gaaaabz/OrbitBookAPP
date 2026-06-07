import { api } from './api';
import type { TokenOut, Usuario } from './types';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  role?: string;
}

export const authService = {
  login: (payload: LoginPayload): Promise<TokenOut> =>
    api.post<TokenOut>('/auth/login', payload),

  register: (payload: RegisterPayload): Promise<TokenOut> =>
    api.post<TokenOut>('/auth/register', { role: 'VIAJANTE', ...payload }),

  me: (): Promise<Usuario> =>
    api.get<Usuario>('/auth/me'),
};
