"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

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
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [activeApplication, setActiveApplication] = useState<ActiveApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (token: string): Promise<DbUser | null> => {
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
        return data.user as DbUser;
      }
    } catch (err) {
      console.error("Failed to fetch database profile:", err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial session
    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (!isMounted) return;
      const initialSession = data.session;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.access_token) {
        await fetchProfile(initialSession.access_token);
      }
      if (isMounted) setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.access_token) {
        await fetchProfile(newSession.access_token);
      } else {
        setDbUser(null);
        setActiveApplication(null);
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
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

  const signInWithGoogleIdToken = useCallback(async (token: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });
    if (error) throw new Error(error.message);
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setDbUser(null);
    setActiveApplication(null);
    if (error) throw new Error(error.message);
  }, [supabase]);

  const adminEmails = [
    'singhshourya434@gmail.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().split(',').map((e) => e.trim()).filter(Boolean) || [])
  ];

  const isConfiguredAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;
  const role: UserRole = dbUser?.role || (isConfiguredAdmin ? "ADMIN" : "BUYER");
  const isBuyer = role === "BUYER" && !isConfiguredAdmin;
  const isSeller = role === "SELLER";
  const isAdmin = role === "ADMIN" || isConfiguredAdmin;
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
        signInWithGoogleIdToken,
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
