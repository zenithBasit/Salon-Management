import { createContext, useContext } from "react";

export const AuthContext = createContext<{ isAuthenticated: boolean; login: () => void; logout: () => void }>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);