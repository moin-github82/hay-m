import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://hay-m-backend.onrender.com';

let socket = null;

export const socketService = {
  connect(userId) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join', userId);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on(event, callback) {
    if (socket) socket.on(event, callback);
  },

  off(event, callback) {
    if (socket) socket.off(event, callback);
  },

  getSocket() {
    return socket;
  },
};
