import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CurrentRoundData {
  exists: boolean;
  isActive: boolean;
  drawnNumbers: number[] | null;
  ticketCount: number;
}

export interface TicketData {
  id: string;
  idNumber: string;
  numbers: number[];
  drawnNumbers: number[] | null;
  createdAt: string;
}

export interface User {
  name?: string;
  email?: string;
  sub?: string;
  picture?: string;
}

// Auth endpoints
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/user');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const login = () => {
  window.location.href = '/auth/login';
};

export const logout = () => {
  window.location.href = '/auth/logout';
};

// Round endpoints
export const getCurrentRound = async (): Promise<CurrentRoundData> => {
  const response = await api.get('/api/rounds/current');
  return response.data;
};

// Ticket endpoints
export const submitTicket = async (idNumber: string, numbers: number[]): Promise<Blob> => {
  const response = await api.post('/api/tickets', { idNumber, numbers }, {
    responseType: 'blob'
  });
  return response.data;
};

export const getTicket = async (id: string): Promise<TicketData> => {
  const response = await api.get(`/api/tickets/${id}`);
  return response.data;
};

export default api;
