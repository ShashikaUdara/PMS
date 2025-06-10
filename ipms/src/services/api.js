import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const parsedToken = JSON.parse(token).access_token;
      config.headers.Authorization = `Bearer ${parsedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  signIn: async (credentials) => {
    try {
      const response = await api.post('/user/signin', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during sign in' };
    }
  },

  signUp: async (userData) => {
    try {
      const response = await api.post('/user/signup', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during sign up' };
    }
  },

  signOut: () => {
    const user = localStorage.getItem('user');
    let userId = null;
    let token = JSON.parse(localStorage.getItem('token')).access_token;
    try {
      userId = user ? JSON.parse(user).id : null;
    } catch (e) {
      userId = null;
    }
    let response = null;
    if (token && userId) {
      response = api.post(
      '/user/signout',
      { userId },
      {
        headers: {
        Authorization: `Bearer ${token}`,
        },
      }
      ).catch(() => {});
    } else {
      response = api.post('/user/signout').catch(() => {});
    }

    if (response) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Project services
export const projectService = {
  createProject: async (projectData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not found');
      }
      const response = await api.post('/project/create', { ...projectData, userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while creating the project' };
    }
  },
  getProjects: async (page = 1, limit = 10, search = '', status = '', sortField = '', sortDirection = '') => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not found');
      }
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        userId: userId.toString()
      });

      if (search) {
        queryParams.append('search', search);
      }
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      if (sortField && sortDirection) {
        queryParams.append('sortField', sortField);
        queryParams.append('sortDirection', sortDirection);
      }

      const response = await api.get(`/projects/list?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching projects' };
    }
  },
  getProjectDetail: async (projectId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not found');
      }

      const queryParams = new URLSearchParams({
        projectId: projectId.toString(),
        userId: userId.toString()
      });

      const response = await api.get(`/project/detail?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching project details' };
    }
  },
};

export default api; 