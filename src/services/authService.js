import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'haym_token';
const USER_KEY  = 'haym_user';

export const authService = {
  async signup(data) {
    const res = await api.post('/auth/signup', data);
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res;
  },

  async logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  async getStoredUser() {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async isLoggedIn() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async updateProfile(data) {
    return api.patch('/auth/me', data);
  },
};
