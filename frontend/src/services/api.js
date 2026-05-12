import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export const carService = {
  getAllCars: () => api.get('/cars/'),
  getAvailableCars: () => api.get('/cars/available/'),
  getCarById: (id) => api.get(`/cars/${id}/`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings/', data),
  getUserBookings: () => api.get('/bookings/'),
};

export const authService = {
  login: (username, password) => api.post('/api-token-auth/', { username, password }),
  register: (userData) => api.post('/register/', userData),
  getProfile: () => api.get('/profile/'),
};

export default api;
