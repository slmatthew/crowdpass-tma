import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { appConfig } from "../config/appConfig";

export function useApiClient() {
  const { token, refreshTokens, logout } = useAuth();

  const instance = axios.create({
    baseURL: appConfig.apiBaseUrl,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (config.headers?.["x-no-auth"]) {
      delete config.headers["x-no-auth"];
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await refreshTokens();
          
          const newToken = localStorage.getItem("crowd-token");
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } else {
            logout();
          }
        } catch(refreshError) {
          logout();
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}