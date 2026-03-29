import api from '../../../core/api/axios.instance';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthTokenResponse>('/auth/login', credentials),

  me: () =>
    api.get<UserProfile>('/auth/me'),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),
};
