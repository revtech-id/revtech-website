"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string | null;
  requirePasswordChange?: boolean;
  _collection?: "admins" | "staff";
}

interface UserContextValue {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  logout: (currentUser?: UserProfile | null) => Promise<void>;
}

const defaultUser: UserProfile = {
  name: "Revan Fatkhurezi",
  role: "Superadmin",
  email: "revtech.id.contact@gmail.com",
  phone: "6281290018819",
  bio: "Solo founder & lead engineer di RevTech Business OS. Mengembangkan solusi website & digital agency untuk UMKM dan bisnis modern.",
  location: "Indonesia",
  website: "https://hi-revtech.my.id",
  avatar: null,
  requirePasswordChange: false,
  _collection: "admins",
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          // 1. Cek tabel admins (Superadmin) terlebih dahulu
          const adminQ = query(collection(db, "admins"), where("email", "==", firebaseUser.email));
          const adminSnap = await getDocs(adminQ);
          
          let userData = null;
          let userType: "admins" | "staff" = "staff";

          if (!adminSnap.empty) {
            userData = adminSnap.docs[0].data();
            userType = "admins";
          } else {
            // 2. Jika tidak ada di admins, cek tabel staff (Karyawan Biasa)
            const staffQ = query(collection(db, "staff"), where("email", "==", firebaseUser.email));
            const staffSnap = await getDocs(staffQ);
            if (!staffSnap.empty) {
              // Cek status karyawan, jika nonaktif tolak login
              const staffData = staffSnap.docs[0].data();
              if (staffData.status === "Nonaktif") {
                console.error("Akun karyawan dinonaktifkan.");
                setUser(null);
                await firebaseSignOut(auth);
                if (pathname.startsWith("/admin")) setTimeout(() => router.push("/"), 0);
                setLoading(false);
                return;
              }
              userData = staffData;
              userType = "staff";
            }
          }
          
          if (userData) {
            setUser({
              name: userData.name || firebaseUser.displayName || "Admin RevTech",
              role: userData.role || "Admin",
              email: firebaseUser.email,
              phone: userData.phone || "-",
              bio: userData.bio || "-",
              location: userData.location || "Indonesia",
              website: userData.website || "-",
              avatar: userData.avatar || firebaseUser.photoURL || null,
              requirePasswordChange: userData.requirePasswordChange || false,
              _collection: userType,
            });
            // Set session cookie for middleware to detect login
            document.cookie = `_auth_token=1; path=/; SameSite=Strict`;
          } else {
            // Jika tidak ada di admins maupun staff
            console.error("Akun terotentikasi tapi tidak terdaftar di sistem internal.");
            setUser(null);
            await firebaseSignOut(auth);
            if (pathname.startsWith("/admin")) {
              setTimeout(() => router.push("/admin-revtech"), 0);
            }
          }
        } catch (error) {
          console.error("Gagal mengambil profil admin:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        // Clear session cookie on logout
        document.cookie = `_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        // Jika sedang di halaman admin dan tidak ada sesi, redirect
        if (pathname.startsWith("/admin")) {
           const redirectUrl = sessionStorage.getItem('logout_redirect') || "/admin-revtech";
           sessionStorage.removeItem('logout_redirect');
           setTimeout(() => router.push(redirectUrl), 0);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async (currentUser?: UserProfile | null) => {
    const resolvedUser = currentUser ?? user;
    const isSuperadmin = resolvedUser?._collection === "admins" && resolvedUser?.role === "Superadmin";
    const loginPage = isSuperadmin ? "/founder-revtech" : "/admin-revtech";
    setLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setTimeout(() => router.push(loginPage), 0);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
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
