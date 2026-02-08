import axios, { AxiosInstance, AxiosError } from 'axios';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth tokens here later if needed)
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here later
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Error]', error.response?.status, error.message);
    
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - redirect to login');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response from server - check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;