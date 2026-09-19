"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, MemberProfile, TrainerProfile } from "@/types";
import {
  initializeStorage,
  getStoredUsers,
  getStoredMembers,
  getStoredTrainers,
  saveUsers,
  saveMembers,
} from "@/lib/storage";
import { apiFetch, setStoredToken, clearStoredToken } from "@/lib/apiClient";

interface AuthContextType {
  user: User | null;
  memberProfile: MemberProfile | null;
  trainerProfile: TrainerProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  loginAsPersona: (role: UserRole) => void;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password?: string,
    extraData?: Record<string, any>
  ) => Promise<{ success: boolean; message?: string; user?: User; memberProfile?: MemberProfile }>;
  updateProfile: (updatedData: Partial<User & MemberProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    initializeStorage();
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // 1. Fetch active session from persistent server endpoint using apiFetch with auth headers & cookies
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.memberProfile) setMemberProfile(data.memberProfile);
          if (data.trainerProfile) setTrainerProfile(data.trainerProfile);
          localStorage.setItem("apex_active_user", JSON.stringify(data.user));
          await syncUsersListFromApi();
          setIsLoaded(true);
          return;
        }
      } else if (res.status === 401) {
        // If server returns 401 explicitly, check if a stored user exists locally before clearing
        const storedUserJson = typeof window !== "undefined" ? localStorage.getItem("apex_active_user") : null;
        if (!storedUserJson) {
          setUser(null);
          setMemberProfile(null);
          setTrainerProfile(null);
          clearStoredToken();
        }
        await syncUsersListFromApi();
        setIsLoaded(true);
        return;
      }
    } catch (err) {
      console.warn("[AUTH] Session check API network error, checking local backup:", err);
    }

    // 2. Fallback to localStorage backup ONLY if network failed
    const storedUserJson = typeof window !== "undefined" ? localStorage.getItem("apex_active_user") : null;
    if (storedUserJson) {
      try {
        const u: User = JSON.parse(storedUserJson);
        setUser(u);
        loadProfilesForUser(u);
      } catch (err) {
        console.error("[AUTH] Failed parsing stored user:", err);
      }
    }

    await syncUsersListFromApi();
    setIsLoaded(true);
  };

  const syncUsersListFromApi = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          const currentLocal = getStoredUsers();
          const mergedUsers = [...data.users];
          // Keep local extra users if any
          currentLocal.forEach((lu) => {
            if (!mergedUsers.some((u) => u.id === lu.id || u.email.toLowerCase() === lu.email.toLowerCase())) {
              mergedUsers.push(lu);
            }
          });
          saveUsers(mergedUsers);
        }
      }
    } catch (err) {
      // Ignore API fetch error on initial offline load
    }
  };

  const loadProfilesForUser = (u: User) => {
    if (u.role === "MEMBER") {
      const members = getStoredMembers();
      const m = members.find((mem) => mem.userId === u.id);
      if (m) setMemberProfile(m);
    } else if (u.role === "TRAINER") {
      const trainers = getStoredTrainers();
      const t = trainers.find((tr) => tr.userId === u.id);
      if (t) setTrainerProfile(t);
    }
  };

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      console.log(`[AUTH] Initiating login for ${email}`);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const authenticatedUser: User = data.user;
        setUser(authenticatedUser);
        localStorage.setItem("apex_active_user", JSON.stringify(authenticatedUser));
        if (data.token) {
          setStoredToken(data.token);
        }

        if (data.memberProfile) setMemberProfile(data.memberProfile);
        if (data.trainerProfile) setTrainerProfile(data.trainerProfile);

        // Sync user into stored local list
        const users = getStoredUsers();
        if (!users.some((u) => u.id === authenticatedUser.id)) {
          saveUsers([...users, { ...authenticatedUser, password }]);
        }

        return { success: true, user: authenticatedUser };
      }

      return {
        success: false,
        message: data.message || "No registered account found with that email address.",
      };
    } catch (err: any) {
      console.error("[AUTH] Login network error:", err);
      return {
        success: false,
        message: err?.message || "Unable to connect to the server. Please check your internet connection.",
      };
    }
  };

  const loginAsPersona = (targetRole: UserRole) => {
    const users = getStoredUsers();
    const personaUser = users.find((u) => u.role === targetRole) || users[0];
    if (personaUser) {
      setUser(personaUser);
      localStorage.setItem("apex_active_user", JSON.stringify(personaUser));
      loadProfilesForUser(personaUser);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[AUTH] Logout error:", err);
    } finally {
      setUser(null);
      setMemberProfile(null);
      setTrainerProfile(null);
      clearStoredToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password?: string,
    extraData?: Record<string, any>
  ): Promise<{ success: boolean; message?: string; user?: User; memberProfile?: MemberProfile }> => {
    try {
      console.log(`[AUTH] Initiating registration for ${email}`);
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password, ...extraData }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Registration failed. Account may already exist.",
        };
      }

      const newUser: User = { ...data.user, password };
      const newMemberProfile: MemberProfile | null = data.memberProfile;

      setUser(newUser);
      if (newMemberProfile) setMemberProfile(newMemberProfile);
      localStorage.setItem("apex_active_user", JSON.stringify(newUser));
      if (data.token) {
        setStoredToken(data.token);
      }

      // Sync into local storage list so UI components receive updated users
      const users = getStoredUsers();
      saveUsers([...users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser]);

      if (newMemberProfile) {
        const members = getStoredMembers();
        saveMembers([...members, newMemberProfile]);
      }

      return { success: true, user: newUser };
    } catch (err: any) {
      console.error("[AUTH] Registration network error:", err);
      return {
        success: false,
        message: err?.message || "Failed to register account. Network error.",
      };
    }
  };

  const updateProfile = (updatedData: Partial<User & MemberProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("apex_active_user", JSON.stringify(updatedUser));

    const users = getStoredUsers();
    const uIdx = users.findIndex((u) => u.id === user.id);
    if (uIdx !== -1) {
      users[uIdx] = updatedUser;
      saveUsers(users);
    }

    if (memberProfile) {
      const updatedMem = { ...memberProfile, ...updatedData };
      setMemberProfile(updatedMem);
      const members = getStoredMembers();
      const mIdx = members.findIndex((m) => m.id === memberProfile.id);
      if (mIdx !== -1) {
        members[mIdx] = updatedMem;
        saveMembers(members);
      }
    }

    // Persist to backend database asynchronously using apiFetch with auth headers
    apiFetch("/api/members/profile", {
      method: "PATCH",
      body: JSON.stringify(updatedData),
    }).catch((err) => console.error("[AUTH] Async profile update sync error:", err));
  };

  if (!isLoaded) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        memberProfile,
        trainerProfile,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
        loginAsPersona,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
