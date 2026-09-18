"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { InspectionRecord, PackagedProduct, AuditLogEntry } from "@/types";
import { sampleInspections, sampleProducts, sampleAuditLogs, currentOfficer } from "@/data/mockData";

interface InspectionContextType {
  inspections: InspectionRecord[];
  products: PackagedProduct[];
  auditLogs: AuditLogEntry[];
  addInspection: (record: InspectionRecord) => void;
  updateFindingAction: (
    inspectionId: string,
    findingId: string,
    action: "ACCEPTED" | "REJECTED" | "MANUAL_VERIFIED",
    remarks?: string
  ) => void;
  updateOfficerNotes: (inspectionId: string, notes: string) => void;
  getInspectionById: (id: string) => InspectionRecord | undefined;
  getProductById: (id: string) => PackagedProduct | undefined;
  resetToDefaults: () => void;
}

const InspectionContext = createContext<InspectionContextType>({
  inspections: sampleInspections,
  products: sampleProducts,
  auditLogs: sampleAuditLogs,
  addInspection: () => {},
  updateFindingAction: () => {},
  updateOfficerNotes: () => {},
  getInspectionById: () => undefined,
  getProductById: () => undefined,
  resetToDefaults: () => {},
});

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspections, setInspections] = useState<InspectionRecord[]>(sampleInspections);
  const [products, setProducts] = useState<PackagedProduct[]>(sampleProducts);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(sampleAuditLogs);

  useEffect(() => {
    try {
      const savedInspections = localStorage.getItem("lg_inspections");
      if (savedInspections) {
        const parsed = JSON.parse(savedInspections);
        // If parsed records contain stale 2025 IDs or lack 2026 records, reset to new canonical dataset
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((r: any) => r.id.startsWith("LG-2025"))) {
          localStorage.removeItem("lg_inspections");
          localStorage.removeItem("lg_products");
          localStorage.removeItem("lg_audit_logs");
          setInspections(sampleInspections);
          setProducts(sampleProducts);
          setAuditLogs(sampleAuditLogs);
        } else {
          setInspections(parsed);
        }
      }
      const savedProducts = localStorage.getItem("lg_products");
      if (savedProducts && !localStorage.getItem("lg_inspections")?.includes("LG-2025")) {
        setProducts(JSON.parse(savedProducts));
      }
      const savedLogs = localStorage.getItem("lg_audit_logs");
      if (savedLogs && !localStorage.getItem("lg_inspections")?.includes("LG-2025")) {
        setAuditLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.error("Failed to load stored inspection data", e);
    }
  }, []);

  const saveInspections = (items: InspectionRecord[]) => {
    setInspections(items);
    localStorage.setItem("lg_inspections", JSON.stringify(items));
  };

  const saveAuditLogs = (logs: AuditLogEntry[]) => {
    setAuditLogs(logs);
    localStorage.setItem("lg_audit_logs", JSON.stringify(logs));
  };

  const addInspection = (record: InspectionRecord) => {
    const updated = [record, ...inspections];
    saveInspections(updated);

    // Also record audit entry
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      inspectionId: record.id,
      timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      officerId: record.officerId,
      officerName: record.officerName,
      action: "Inspection Conducted",
      details: `Scanned ${record.productName}. Status: ${record.status}, Coverage: ${record.coverageScore}%.`,
    };
    saveAuditLogs([newLog, ...auditLogs]);
  };

  const updateFindingAction = (
    inspectionId: string,
    findingId: string,
    action: "ACCEPTED" | "REJECTED" | "MANUAL_VERIFIED",
    remarks?: string
  ) => {
    const updated = inspections.map((insp) => {
      if (insp.id !== inspectionId) return insp;
      const findings = insp.findings.map((f) => {
        if (f.id !== findingId) return f;
        return {
          ...f,
          officerAction: action,
          remarks: remarks !== undefined ? remarks : f.remarks,
        };
      });
      return { ...insp, findings, updatedAt: new Date().toISOString() };
    });
    saveInspections(updated);

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      inspectionId,
      timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      action: `Finding ${action}`,
      details: `Officer reviewed finding ${findingId} on ${inspectionId}. Action: ${action}.`,
    };
    saveAuditLogs([newLog, ...auditLogs]);
  };

  const updateOfficerNotes = (inspectionId: string, notes: string) => {
    const updated = inspections.map((insp) => {
      if (insp.id !== inspectionId) return insp;
      return { ...insp, officerNotes: notes, updatedAt: new Date().toISOString() };
    });
    saveInspections(updated);
  };

  const getInspectionById = (id: string): InspectionRecord | undefined => {
    return inspections.find((i) => i.id.toLowerCase() === id.toLowerCase());
  };

  const getProductById = (id: string): PackagedProduct | undefined => {
    return products.find((p) => p.id.toLowerCase() === id.toLowerCase());
  };

  const resetToDefaults = () => {
    localStorage.removeItem("lg_inspections");
    localStorage.removeItem("lg_products");
    localStorage.removeItem("lg_audit_logs");
    setInspections(sampleInspections);
    setProducts(sampleProducts);
    setAuditLogs(sampleAuditLogs);
  };

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        products,
        auditLogs,
        addInspection,
        updateFindingAction,
        updateOfficerNotes,
        getInspectionById,
        getProductById,
        resetToDefaults,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => useContext(InspectionContext);
