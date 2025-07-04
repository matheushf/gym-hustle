"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, user: null });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children, user }: { children: ReactNode, user: User | null }) {

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
} 