import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/token/', credentials),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/update/', data),
  getUserProfile: (username) => api.get(`/auth/users/${username}/`),
};

// Post APIs
export const postAPI = {
  getPosts: (params) => api.get('/blog/posts/', { params }),
  getPost: (slug) => api.get(`/blog/posts/${slug}/`),
  createPost: (data) => api.post('/blog/posts/create/', data),
  updatePost: (slug, data) => api.patch(`/blog/posts/${slug}/update/`, data),
  deletePost: (slug) => api.delete(`/blog/posts/${slug}/delete/`),
  getMyPosts: () => api.get('/blog/posts/my-posts/'),
  getBookmarkedPosts: () => api.get('/blog/posts/bookmarked/'),
  toggleLike: (slug) => api.post(`/blog/posts/${slug}/like/`),
  toggleBookmark: (slug) => api.post(`/blog/posts/${slug}/bookmark/`),
  togglePin: (slug) => api.post(`/blog/posts/${slug}/pin/`),
};

// Tag APIs
export const tagAPI = {
  getTags: () => api.get('/blog/tags/'),
  createTag: (data) => api.post('/blog/tags/create/', data),
};

// Comment APIs
export const commentAPI = {
  getComments: (postSlug) => api.get(`/blog/posts/${postSlug}/comments/`),
  createComment: (postSlug, data) => api.post(`/blog/posts/${postSlug}/comments/create/`, data),
  deleteComment: (commentId) => api.delete(`/blog/comments/${commentId}/delete/`),
};

export default api;
