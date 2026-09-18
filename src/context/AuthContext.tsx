"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, UserProfile } from "@/types";
import { currentOfficer } from "@/data/mockData";

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  canPerformAction: (action: "INSPECT" | "APPROVE_VIOLATION" | "EDIT_RULES" | "GENERATE_REPORT" | "DELETE_RECORD") => boolean;
}

const roleProfiles: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: "ADM-2026-001",
    name: "Enforcement Supervisor (Demo)",
    badgeNumber: "SUP-DEMO-2026",
    designation: "Enforcement & Regulatory Supervisor (Demo)",
    department: "Department of Consumer Affairs (Context)",
    jurisdiction: "HQ Command Centre (Demo)",
    role: "ADMIN",
  },
  OFFICER: currentOfficer,
  INSPECTOR: {
    id: "INSP-2026-042",
    name: "Prototype Inspector",
    badgeNumber: "INSP-DEMO-2026",
    designation: "Field Inspection Officer (Demo)",
    department: "Field Inspection Unit (Context)",
    jurisdiction: "Central Enforcement Division (Zone 1)",
    role: "INSPECTOR",
  },
  REVIEWER: {
    id: "REV-2026-109",
    name: "Appellate Reviewer (Demo)",
    badgeNumber: "REV-DEMO-2026",
    designation: "Compliance Reviewer & Analyst (Demo)",
    department: "Legal Metrology Review Board (Context)",
    jurisdiction: "Regional Appellate Review Unit",
    role: "REVIEWER",
  },
};

const AuthContext = createContext<AuthContextType>({
  user: currentOfficer,
  role: "OFFICER",
  switchRole: () => {},
  canPerformAction: () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("OFFICER");

  useEffect(() => {
    const saved = localStorage.getItem("lg_role") as UserRole;
    if (saved && roleProfiles[saved]) {
      setRole(saved);
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("lg_role", newRole);
  };

  const canPerformAction = (action: "INSPECT" | "APPROVE_VIOLATION" | "EDIT_RULES" | "GENERATE_REPORT" | "DELETE_RECORD"): boolean => {
    switch (action) {
      case "INSPECT":
        return ["ADMIN", "OFFICER", "INSPECTOR"].includes(role);
      case "APPROVE_VIOLATION":
        return ["ADMIN", "OFFICER", "REVIEWER"].includes(role);
      case "EDIT_RULES":
        return role === "ADMIN";
      case "GENERATE_REPORT":
        return true;
      case "DELETE_RECORD":
        return role === "ADMIN";
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: roleProfiles[role],
        role,
        switchRole,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
