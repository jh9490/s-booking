// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export interface Role {
  name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name:string;
  mobile_number: string;
  unit: string;
  role: Role;
  profile_id :number,
  has_prev_request:boolean
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  authLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  authLoading: true,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
  getRefreshToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser, storedRefresh] = await Promise.all([
          SecureStore.getItemAsync("access_token"),
          SecureStore.getItemAsync("user_info"),
          SecureStore.getItemAsync("refresh_token"),
        ]);

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
        }

        if (storedRefresh) {
          setRefreshToken(storedRefresh);
        }
      } catch (err) {
        console.error("Failed to load auth data:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (user: User, accessToken: string, refreshToken: string) => {
    console.log(accessToken);
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("user_info", JSON.stringify(user));
    await SecureStore.setItemAsync("refresh_token", refreshToken);

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("user_info");
    await SecureStore.deleteItemAsync("refresh_token");

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const getToken = async () => accessToken;
  const getRefreshToken = async () => refreshToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        authLoading,
        login,
        logout,
        getToken,
        getRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
