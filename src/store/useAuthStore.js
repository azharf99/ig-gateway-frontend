import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/register', { username, email, password });
      set({ loading: false });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  getInstagramOAuthURL: async () => {
    try {
      const response = await api.get('/auth/instagram/url');
      return response.data.url;
    } catch (err) {
      console.error('Failed to get Instagram OAuth URL:', err);
      return null;
    }
  },

  linkInstagram: async (code) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/instagram/link', { code });
      // Refresh profile data
      await get().fetchMe();
      set({ loading: false });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to link Instagram account';
      set({ error: errMsg, loading: false });
      return false;
    }
  }
}));

export default useAuthStore;
