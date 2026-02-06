"use client";

import { createContext, useEffect, useContext, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { UsersService } from "../lib/api/users";
import { OnboardingContext } from "./onboarding.context";
import { AuthContextType } from "../utils/types";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // 👈 important
  const onboarding = useContext(OnboardingContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);

      if (!firebaseUser) {
        setUser(null);
        onboarding?.resetOnBoardingState();
        setAuthLoading(false);
        return;
      }

      try {
        const res = await UsersService.getUserByFirebaseId(firebaseUser.uid);
        setUser(res.data);

        // keep role in sync
        localStorage.setItem("userRole", res.data.role);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
