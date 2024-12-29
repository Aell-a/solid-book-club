// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Session,
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";

interface AuthContextType {
  session: Session;
  login: (oidcIssuer: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session>(getDefaultSession());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const handleRedirect = async () => {
      await handleIncomingRedirect({ restorePreviousSession: true });
      if (session.info.isLoggedIn) {
        setIsLoggedIn(true);
      }
    };

    handleRedirect();
  }, []);

  const loginHandler = async (oidcIssuer: string) => {
    try {
      await login({
        oidcIssuer,
        redirectUrl: window.location.href,
        clientName: "Solid Book Club",
      });
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const logoutHandler = async () => {
    try {
      await logout();
      setSession(getDefaultSession());
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        login: loginHandler,
        logout: logoutHandler,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
