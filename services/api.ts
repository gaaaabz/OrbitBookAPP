// IP da máquina host onde o Docker está rodando.
// Usar o IP da rede Wi-Fi funciona para: Expo Go em device físico,
// emulador Android e iOS Simulator — desde que estejam na mesma rede.
// Para descobrir o IP atual: ipconfig (Windows) ou ifconfig (Mac/Linux)
export const BASE_URL = 'https://orbitbook-api.wittybush-4b565985.southafricanorth.azurecontainerapps.io';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // ignora erro de parse
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
