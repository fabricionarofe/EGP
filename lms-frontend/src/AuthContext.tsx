import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (userData: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function signIn(userData: User) {
    setUser(userData);
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}