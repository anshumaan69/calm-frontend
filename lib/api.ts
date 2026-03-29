import axios from 'axios';

const api = axios.create({
  // Proxy via Next.js next.config.ts
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Bypass ngrok browser warning
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  return config;
});

// Handle 401 (Token Expired) → Auto Refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config); // Retry original request
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  status: string;
  isActive: boolean;
}

export interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isManuallyBlocked: boolean;
  isPast: boolean;
  isDisabled: boolean;
}

export interface Appointment {
  _id: string;
  doctorId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  orderId?: string;
  meetLink?: string;
}
