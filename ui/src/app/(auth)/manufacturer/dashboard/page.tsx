"use client";

import { useContext } from "react";
import { AuthContext } from "../../../../context/auth.context";
import { AuthContextType } from "../../../../utils/types";

const Manufacturer = () => {
  const { onBoardingData, loading } = useContext(
    AuthContext,
  ) as AuthContextType;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 min-h-screen">
      {onBoardingData.role} <span>{onBoardingData.name}</span>
    </div>
  );
};

export default Manufacturer;
