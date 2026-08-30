"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  institution?: string | null;
  department?: string | null;
  role: UserRole;
  isSuspended: boolean;
  suspendedReason?: string | null;
  rating: number;
  completedDeals: number;
  createdAt: string;
}

export interface ActiveApplication {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  dbUser: DbUser | null;
  activeApplication: ActiveApplication | null;
  role: UserRole;
  isBuyer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [activeApplication, setActiveApplication] = useState<ActiveApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setActiveApplication(data.latestApplication || null);
      }
    } catch (err) {
      console.error("Failed to fetch database profile:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    // Fetch initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        await fetchProfile(session.access_token);
      }
      setIsLoading(false);
    };
    
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        await fetchProfile(session.access_token);
      } else {
        setDbUser(null);
        setActiveApplication(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name } // Pass the name in user metadata
      }
    });
    if (error) throw new Error(error.message);
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw new Error(error.message);
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setDbUser(null);
    setActiveApplication(null);
    if (error) throw new Error(error.message);
  }, [supabase]);

  const role: UserRole = dbUser?.role || "BUYER";
  const isBuyer = role === "BUYER";
  const isSeller = role === "SELLER";
  const isAdmin = role === "ADMIN";
  const isSuspended = dbUser?.isSuspended || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        dbUser,
        activeApplication,
        role,
        isBuyer,
        isSeller,
        isAdmin,
        isSuspended,
        isAuthenticated: !!user,
        isLoading,
        refreshProfile,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
