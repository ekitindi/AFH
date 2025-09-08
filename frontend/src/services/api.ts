import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) => api.post('/auth/register', userData),
  
  verifyToken: () => api.get('/auth/verify'),
  
  getProfile: () => api.get('/auth/profile'),
  
  logout: () => api.post('/auth/logout')
};

// Homes API calls
export const homesAPI = {
  getHomes: () => api.get('/homes'),
  
  getHome: (id: number) => api.get(`/homes/${id}`),
  
  createHome: (homeData: {
    name: string;
    licenseNumber?: string;
    address: string;
    city: string;
    zipCode: string;
    phone?: string;
    maxResidents: number;
  }) => api.post('/homes', homeData)
};

export default api;
