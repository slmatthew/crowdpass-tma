import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/types/models/";
import { fetchTyped, postTyped } from "@/lib/typedApiClient";
import { postEvent } from "@telegram-apps/sdk-react";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (newAccessToken: string, newRefreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("crowd-token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("crowd-refresh-token"));

  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token]);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetchTyped<{ user: User }>(token, "dashboard/me");
      setUser(res.user);
    } catch (err: any) {
      console.error("Ошибка при загрузке пользователя:", err);
      if(err?.response?.status === 401) {
        if(refreshToken) {
          console.info('Trying to refresh token...');
          await refreshTokens();
        } else {
          logout();
        }
      }
    }
  };

  const refreshTokens = async () => {
    if (!refreshToken) return;

    try {
      const res = await postTyped<{ accessToken: string, refreshToken: string }>(token ?? '', "auth/refresh", {
        refreshToken
      });

      if (res.accessToken && res.refreshToken) {
        localStorage.setItem("crowd-token", res.accessToken);
        localStorage.setItem("crowd-refresh-token", res.refreshToken);
        setToken(res.accessToken);
        setRefreshToken(res.refreshToken);
        refreshUser();
      } else {
        logout();
      }
    } catch (err) {
      console.error("Ошибка при обновлении токенов:", err);
      logout();
    }
  };

  const login = (newAccessToken: string, newRefreshToken: string) => {
    if(newAccessToken === token && newRefreshToken === refreshToken) return;

    localStorage.setItem("crowd-token", newAccessToken);
    localStorage.setItem("crowd-refresh-token", newRefreshToken);
    setToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("crowd-token");
    localStorage.removeItem("crowd-refresh-token");
    setToken(null);
    setRefreshToken(null);
    setUser(null);

    postEvent('iframe_will_reload');
    location.reload();
  };

  return (
    <AuthContext.Provider
      value={{ token, refreshToken, user, isAuthenticated, login, logout, refreshUser, refreshTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  }
  return context;
}