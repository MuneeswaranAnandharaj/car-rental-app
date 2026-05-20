import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export const carService = {
  getAllCars: () => api.get('/cars/'),
  getAvailableCars: () => api.get('/cars/available/'),
  getCarById: (id) => api.get(`/cars/${id}/`),
  createCar: (data) => api.post('/cars/', data),
  updateCar: (id, data) => api.patch(`/cars/${id}/`, data),
  deleteCar: (id) => api.delete(`/cars/${id}/`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings/', data),
  getUserBookings: () => api.get('/bookings/'),
};

export const authService = {
  login: (username, password) => api.post('/api-token-auth/', { username, password }),
  register: (userData) => api.post('/register/', userData),
};

export default api;
