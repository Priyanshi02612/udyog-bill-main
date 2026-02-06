"use client";

import { useContext } from "react";
import { AuthContextType } from "../../../../utils/types";
import { AuthContext } from "../../../../context/auth.context";

const Manufacturer = () => {
  const { authLoading, user } = useContext(AuthContext) as AuthContextType;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center gap-2 h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 min-h-screen">
      {user.role} <span>{user.name}</span>
    </div>
  );
};

export default Manufacturer;
