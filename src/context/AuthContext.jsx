import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [isLoading, setIsLoading] = useState(true);

  const authApi = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });

    instance.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken('');
        setUser(null);
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const register = async (payload) => {
    const response = await authApi.post('/auth/register', payload);
    const responseToken = response?.data?.token;
    const responseUser = response?.data?.user;

    if (responseToken && responseUser) {
      localStorage.setItem(TOKEN_KEY, responseToken);
      localStorage.setItem(USER_KEY, JSON.stringify(responseUser));
      setToken(responseToken);
      setUser(responseUser);
    }

    return response.data;
  };

  const login = async (payload) => {
    const response = await authApi.post('/auth/login', payload);
    const responseToken = response?.data?.token;
    const responseUser = response?.data?.user;

    if (responseToken && responseUser) {
      localStorage.setItem(TOKEN_KEY, responseToken);
      localStorage.setItem(USER_KEY, JSON.stringify(responseUser));
      setToken(responseToken);
      setUser(responseUser);
    }

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    logout,
    authApi,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
