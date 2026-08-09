"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string | null;
}

interface UserContextValue {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const defaultUser: UserProfile = {
  name: "Revan Fatkhurezi",
  role: "Founder & CEO",
  email: "revtech.id.contact@gmail.com",
  phone: "6281290018819",
  bio: "Solo founder & lead engineer di RevTech Business OS. Mengembangkan solusi website & digital agency untuk UMKM dan bisnis modern.",
  location: "Indonesia",
  website: "https://hi-revtech.my.id",
  avatar: null,
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("adm-user-profile");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("adm-user-profile", JSON.stringify(user));
    }
  }, [user, mounted]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
