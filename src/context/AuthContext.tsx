"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, UserProfile } from "@/types";
import { currentOfficer } from "@/data/mockData";

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginAsDemo: () => void;
  logout: () => void;
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
  user: roleProfiles.INSPECTOR,
  role: "INSPECTOR",
  isAuthenticated: false,
  isLoading: true,
  login: () => ({ success: false }),
  loginAsDemo: () => {},
  logout: () => {},
  switchRole: () => {},
  canPerformAction: () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("INSPECTOR");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const authSaved = localStorage.getItem("lg_authenticated");
      const roleSaved = localStorage.getItem("lg_role") as UserRole;
      if (authSaved === "true") {
        setIsAuthenticated(true);
        if (roleSaved && roleProfiles[roleSaved]) {
          setRole(roleSaved);
        } else {
          setRole("INSPECTOR");
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, pass: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (
      (cleanEmail === "inspector@labelguard.demo" || cleanEmail === "insp-2026-042" || cleanEmail === "inspector") &&
      cleanPass === "Demo@2026"
    ) {
      setIsAuthenticated(true);
      setRole("INSPECTOR");
      try {
        localStorage.setItem("lg_authenticated", "true");
        localStorage.setItem("lg_role", "INSPECTOR");
      } catch {}
      return { success: true };
    }
    return {
      success: false,
      error: "Invalid credentials. Please use the demo account credentials below (Demo@2026).",
    };
  };

  const loginAsDemo = () => {
    setIsAuthenticated(true);
    setRole("INSPECTOR");
    try {
      localStorage.setItem("lg_authenticated", "true");
      localStorage.setItem("lg_role", "INSPECTOR");
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("lg_authenticated");
    } catch {}
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    try {
      localStorage.setItem("lg_role", newRole);
    } catch {}
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
        isAuthenticated,
        isLoading,
        login,
        loginAsDemo,
        logout,
        switchRole,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
