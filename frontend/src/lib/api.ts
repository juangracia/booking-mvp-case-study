import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Resource,
  Booking,
  BookingRequest,
  ResourceRequest,
  AvailabilitySlot,
  ApiError,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:28080';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<{ id: string; email: string; role: string }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const resourceApi = {
  getAll: async (): Promise<Resource[]> => {
    const response = await api.get<Resource[]>('/resources');
    return response.data;
  },

  getById: async (id: string): Promise<Resource> => {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  getAvailability: async (id: string, date: string): Promise<AvailabilitySlot[]> => {
    const response = await api.get<AvailabilitySlot[]>(`/resources/${id}/availability`, {
      params: { date },
    });
    return response.data;
  },
};

export const bookingApi = {
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  create: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  cancel: async (id: string): Promise<Booking> => {
    const response = await api.delete<Booking>(`/bookings/${id}`);
    return response.data;
  },
};

export const adminApi = {
  getAllResources: async (): Promise<Resource[]> => {
    const response = await api.get<Resource[]>('/admin/resources');
    return response.data;
  },

  createResource: async (data: ResourceRequest): Promise<Resource> => {
    const response = await api.post<Resource>('/admin/resources', data);
    return response.data;
  },

  updateResource: async (id: string, data: ResourceRequest): Promise<Resource> => {
    const response = await api.put<Resource>(`/admin/resources/${id}`, data);
    return response.data;
  },

  getAllBookings: async (params?: {
    resourceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/admin/bookings', { params });
    return response.data;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await api.delete<Booking>(`/admin/bookings/${id}`);
    return response.data;
  },
};

export default api;
