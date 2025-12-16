export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  resource: Resource;
  user: User;
  startAt: string;
  endAt: string;
  status: 'ACTIVE' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  booked: boolean;
  bookingId: string | null;
}

export interface ApiError {
  timestamp: string;
  path: string;
  errorCode: string;
  message: string;
  validationErrors?: Record<string, string>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface BookingRequest {
  resourceId: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export interface ResourceRequest {
  name: string;
  description?: string;
  active?: boolean;
}
