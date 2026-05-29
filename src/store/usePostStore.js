import { create } from 'zustand';
import api from '../utils/api';

const usePostStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/posts');
      set({ posts: response.data.posts, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load posts', loading: false });
    }
  },

  fetchPostByID: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/posts/${id}`);
      set({ currentPost: response.data.post, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to load post details', loading: false });
    }
  },

  createPost: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        posts: [response.data.post, ...state.posts],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create post', loading: false });
      return false;
    }
  },

  deletePost: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/posts/${id}`);
      set((state) => ({
        posts: state.posts.filter((post) => post.ID !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete post', loading: false });
      return false;
    }
  },
}));

export default usePostStore;
