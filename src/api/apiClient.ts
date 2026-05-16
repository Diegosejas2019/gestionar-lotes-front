const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const TOKEN_KEY = 'gestionar_lotes_token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallback = response.status === 401
      ? 'Sesión inválida o expirada. Cargá nuevamente el token.'
      : response.status === 400
        ? 'No se pudo completar la operación. Revisá los datos enviados.'
        : 'Ocurrió un error al comunicarse con la API.';
    throw new ApiError(payload?.message || fallback, response.status);
  }

  return (payload?.data || {}) as T;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest<T>(`${path}?${qs}`);
  }
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return parseResponse<T>(response);
}
