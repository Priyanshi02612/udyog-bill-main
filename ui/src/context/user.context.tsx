"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { AuthContext } from "./auth.context";
import {
  AuthContextType,
  SignupPayload,
  UserContextType,
  UserProfile,
} from "../utils/types";
import {
  GSTIN_REGEX,
  MAX_NEW_FINANCIAL_YEARS,
  PHONE_REGEX,
  UserRole,
} from "../utils/constants";
import { AuthService } from "../lib/api/auth";
import { buildFinancialYear } from "../utils/helpers";

const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);

const getCurrentFinancialStartYear = () => {
  const today = new Date();
  return today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
};

const validateProfile = (profile: UserProfile): boolean => {
  if (!profile.businessName.trim()) {
    toast.error("Business name is required");
    return false;
  }

  if (!PHONE_REGEX.test(normalizePhone(profile.phone))) {
    toast.error("Enter valid 10-digit phone number");
    return false;
  }

  if (!GSTIN_REGEX.test(profile.gstin.trim().toUpperCase())) {
    toast.error("Enter valid GSTIN");
    return false;
  }

  if (!profile.activeFinancialYearId) {
    toast.error("Select active financial year");
    return false;
  }

  return true;
};

const buildPayload = (
  profile: UserProfile,
  authUser: AuthContextType["user"],
): SignupPayload | null => {
  if (!authUser?.firebaseUid || !authUser?.email) return null;

  const sortedFinancialYears = profile.financialYears
    ? profile.financialYears.sort((a, b) => b.startYear - a.startYear)
    : [];

  return {
    firebaseUid: authUser.firebaseUid,
    email: authUser.email,
    role:
      authUser.role === UserRole.WHOLESALER
        ? UserRole.WHOLESALER
        : UserRole.MANUFACTURER,
    ...profile,
    financialYears: sortedFinancialYears,
    businessName: profile.businessName.trim(),
    contactPerson: profile.contactPerson.trim(),
    phone: normalizePhone(profile.phone),
    gstin: profile.gstin.trim().toUpperCase(),
    registeredAddress: profile.registeredAddress.trim(),
  };
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const dashboardPath =
    user?.role === UserRole.WHOLESALER
      ? "/wholesaler/dashboard"
      : "/manufacturer/dashboard";

  const safeUser: UserProfile = user ?? {
    businessName: "",
    contactPerson: "",
    phone: "",
    gstin: "",
    registeredAddress: "",
    financialYears: [],
    activeFinancialYearId: "",
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(safeUser);
  const [initialProfile, setInitialProfile] = useState<UserProfile>(safeUser);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setUserProfile(user);
      setInitialProfile(user);
    }
  }, [user]);

  const hasUnsavedProfileChanges = useMemo(
    () => JSON.stringify(userProfile) !== JSON.stringify(initialProfile),
    [userProfile, initialProfile],
  );

  const addedFinancialYearCount = useMemo(() => {
    const today = new Date();
    return userProfile.financialYears.filter((fy) => {
      const start = new Date(fy.startYear, 3, 1);
      return today < start;
    }).length;
  }, [userProfile.financialYears]);

  const canAddFinancialYear = addedFinancialYearCount < MAX_NEW_FINANCIAL_YEARS;

  const canActivateFinancialYear = (startYear: number) => {
    const today = new Date();
    const fyStart = new Date(startYear, 3, 1);
    return today >= fyStart;
  };

  const handleDiscardProfileChanges = () => {
    setUserProfile(initialProfile);
    router.push(dashboardPath);
  };

  const handleSaveProfile = async () => {
    if (!validateProfile(userProfile)) return;

    const payload = buildPayload(userProfile, user);
    if (!payload) {
      toast.error("Invalid user session. Please login again.");
      return;
    }

    try {
      setSavingProfile(true);
      const { data } = await AuthService.createUser(payload);
      setUser(data);
      toast.success("Profile updated successfully");
      router.replace(dashboardPath);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddFinancialYear = (startYear: number) => {
    const currentFinancialStartYear = getCurrentFinancialStartYear();
    if (startYear < currentFinancialStartYear) {
      toast.error("Previous financial years cannot be added.");
      return;
    }

    const alreadyExists = userProfile.financialYears.some(
      (financialYear) => financialYear.startYear === startYear,
    );
    if (alreadyExists) {
      toast.error("This financial year already exists.");
      return;
    }

    const nextFinancialYear = buildFinancialYear(startYear, startYear + 1);

    setUserProfile((prev) => ({
      ...prev,
      financialYears: [nextFinancialYear, ...prev.financialYears],
    }));

    toast.success(`${nextFinancialYear.label} added.`);
  };

  const handleActivateFinancialYear = (financialYearId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      activeFinancialYearId: financialYearId,
    }));
    toast.success("Financial year activated.");
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        savingProfile,
        canAddFinancialYear,
        addedFinancialYearCount,
        canActivateFinancialYear,
        hasUnsavedProfileChanges,
        handleDiscardProfileChanges,
        handleSaveProfile,
        handleAddFinancialYear,
        handleActivateFinancialYear,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
