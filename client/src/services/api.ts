import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  creator: { id: string; name: string };
  created_at: string;
  users: Array<{ id: string; name: string; ticked: boolean; ticked_at?: string }>;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const billsApi = {
  getAll: () => api.get('/bills'),
  create: (title: string, amount: number) =>
    api.post('/bills', { title, amount }),
  getOne: (id: string) => api.get(`/bills/${id}`),
  toggleTick: (billId: string, userId: string) =>
    api.post(`/bills/${billId}/tick`, { userId }),
};

export default api;
