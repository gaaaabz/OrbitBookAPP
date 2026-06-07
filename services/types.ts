export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string | null;
  criado_em: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface AvaliacaoResumo {
  media: number;
  total: number;
}

export interface Destino {
  id: number;
  nome: string;
  tipo: string | null;
  descricao: string;
  capacidade_max: number;
  preco_base: number;
  distance_km: number;
  image_url: string;
  ativo: number;
  avaliacao: AvaliacaoResumo | null;
}

export interface DestinoCreate {
  nome: string;
  tipo: string;
  descricao: string;
  distance_km: number;
  preco_base: number;
  capacidade_max: number;
  image_url: string;
}

export interface DestinoUpdate {
  nome?: string;
  descricao?: string;
  preco_base?: number;
  image_url?: string;
}

export interface Reserva {
  id: number;
  usuario_id: number;
  destino_id: number;
  departure_date: string;
  return_date: string;
  num_passageiros: number;
  valor_total: number;
  status: string | null;
  criado_em: string | null;
}

export interface ReservaCreate {
  destino_id: number;
  departure_date: string;
  return_date: string;
  num_passageiros: number;
}

export interface ReservaStatusUpdate {
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_MISSAO' | 'CONCLUIDO' | 'CANCELADO';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  content: string;
  suggestions: string[];
  recomendacao_id: number | null;
}

export interface ApiError {
  detail: string;
}
