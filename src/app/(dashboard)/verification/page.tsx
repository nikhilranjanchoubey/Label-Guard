"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { OfficerVerificationModal } from "@/components/verification/OfficerVerificationModal";
import { AuditTrailModal } from "@/components/audit/AuditTrailModal";
import {
  ComplianceResult,
  RuleEvaluation,
  BoundingBox,
} from "@/lib/compliance/types";
import { getActiveComplianceResult } from "@/lib/compliance/client";
import { SAMPLE_COMPLIANCE_INPUT } from "@/lib/compliance/demoSample";
import { complianceEngine } from "@/lib/compliance/engine";
import {
  OfficerAction,
  OfficerVerification,
  InspectionVerificationState,
} from "@/lib/verification/types";
import {
  getActiveUser,
  setActiveUserRole,
  submitVerification,
  submitSupervisorSignoff,
  getInspectionVerificationState,
  getVerificationSummary,
  fetchAuditTrail,
} from "@/lib/verification/client";
import { AuditTrail, AuditUser, UserRole } from "@/lib/audit/types";
import {
  CheckCircle2,
  FileText,
  UserCheck,
  History,
  RefreshCw,
  Info,
  ExternalLink,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

export default function VerificationPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [verificationState, setVerificationState] = useState<InspectionVerificationState | null>(null);
  const [activeUser, setActiveUser] = useState<AuditUser>(getActiveUser());
  const [selectedEvaluation, setSelectedEvaluation] = useState<RuleEvaluation | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<OfficerAction>("CONFIRM");
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditTrail | null>(null);
  const [supervisorRemarks, setSupervisorRemarks] = useState(
    "Inspected complete packaging specimen and verified metric markings pursuant to Legal Metrology Act, 2009."
  );
  const [isSigningOff, setIsSigningOff] = useState(false);

  // Load compliance evaluation & verification state
  useEffect(() => {
    let result = getActiveComplianceResult();
    if (!result || !result.rulesEvaluated || result.rulesEvaluated.length === 0) {
      // Evaluate sample package so inspector has immediate real rules
      result = complianceEngine.evaluate(SAMPLE_COMPLIANCE_INPUT);
    }
    setComplianceResult(result);

    const state = getInspectionVerificationState(result.inspectionId);
    setVerificationState(state);

    // Default select first rule
    if (result.rulesEvaluated.length > 0) {
      setSelectedEvaluation(result.rulesEvaluated[0]);
    }
  }, []);

  const refreshState = () => {
    if (complianceResult) {
      const state = getInspectionVerificationState(complianceResult.inspectionId);
      setVerificationState({ ...state });
    }
  };

  // Convert RuleEvaluation evidence to BoundingBox for EvidenceViewer
  const viewerBoxes: BoundingBox[] = useMemo(() => {
    if (!complianceResult) return [];

    const boxes: BoundingBox[] = [];
    complianceResult.rulesEvaluated.forEach((ev) => {
      if (ev.evidence && ev.evidence.boundingBox) {
        const { x, y, width, height } = ev.evidence.boundingBox;
        boxes.push({
          id: `box-${ev.internalRuleId}`,
          fieldKey: ev.internalRuleId as unknown as BoundingBox["fieldKey"],
          x,
          y,
          width: Math.max(8, width),
          height: Math.max(5, height),
          rawText: ev.evidence.ocrText,
          ocrConfidence: ev.evidence.ocrConfidence,
          status:
            ev.status === "PASS"
              ? "COMPLIANT"
              : ev.status === "REVIEW"
              ? "REVIEW_REQUIRED"
              : "VIOLATION",
        });
      }
    });

    return boxes;
  }, [complianceResult]);

  const selectedBoxId = useMemo(() => {
    if (!selectedEvaluation) return undefined;
    return `box-${selectedEvaluation.internalRuleId}`;
  }, [selectedEvaluation]);

  // Handle Role Switch
  const handleRoleChange = (role: UserRole) => {
    const updated = setActiveUserRole(role);
    setActiveUser(updated);
    toast({
      title: "Active Role Switched",
      description: `Active role updated to ${role} (${updated.name}). Permissions re-evaluated.`,
      type: "info",
    });
  };

  // Trigger Action Modal
  const handleOpenActionModal = (evaluation: RuleEvaluation, action: OfficerAction) => {
    setSelectedEvaluation(evaluation);
    setModalAction(action);
    setActionModalOpen(true);
  };

  // Submit Officer Verification
  const handleVerificationSubmit = async (data: {
    action: OfficerAction;
    officerStatus: OfficerVerification["officerStatus"];
    reason: string;
    note?: string;
    newValue?: string;
  }) => {
    if (!complianceResult || !selectedEvaluation) return;

    const res = await submitVerification(
      {
        inspectionId: complianceResult.inspectionId,
        ruleEvaluationId: selectedEvaluation.ruleId,
        internalRuleId: selectedEvaluation.internalRuleId,
        action: data.action,
        officerStatus: data.officerStatus,
        officer: activeUser,
        reason: data.reason,
        note: data.note,
        newValue: data.newValue,
      },
      selectedEvaluation
    );

    if (res.success) {
      toast({
        title: "Determination Recorded",
        description: `Status marked ${data.officerStatus} for ${selectedEvaluation.internalRuleId}. Audit event logged.`,
        type: data.officerStatus === "CONFIRMED" ? "success" : data.officerStatus === "REJECTED" ? "error" : "warning",
      });
      refreshState();
    } else {
      toast({
        title: "Verification Error",
        description: res.error || "Failed to record determination.",
        type: "error",
      });
    }
  };

  // Supervisor Formal Sign-Off
  const handleSupervisorSignoff = async (approved: boolean) => {
    if (!complianceResult) return;

    if (activeUser.role !== "SUPERVISOR" && activeUser.role !== "ADMIN") {
      toast({
        title: "Permission Denied",
        description: "Formal sign-off requires SUPERVISOR or ADMIN role. Switch role using the top selector.",
        type: "error",
      });
      return;
    }

    setIsSigningOff(true);
    try {
      const res = await submitSupervisorSignoff({
        inspectionId: complianceResult.inspectionId,
        supervisor: activeUser,
        approved,
        remarks: supervisorRemarks,
      });

      if (res.success) {
        toast({
          title: approved ? "Inspection Dossier Approved" : "Inspection Dossier Rejected",
          description: `Cryptographic supervisor sign-off recorded by ${activeUser.name}.`,
          type: approved ? "success" : "error",
        });
        refreshState();
      } else {
        toast({
          title: "Sign-Off Error",
          description: res.error || "Failed to record supervisor signoff.",
          type: "error",
        });
      }
    } finally {
      setIsSigningOff(false);
    }
  };

  // Open Audit Trail
  const handleOpenAuditTrail = async () => {
    if (!complianceResult) return;
    const trail = await fetchAuditTrail(complianceResult.inspectionId);
    setAuditTrail(trail);
    setAuditModalOpen(true);
  };

  if (!complianceResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-semibold text-slate-600">
          Loading verification cockpit...
        </span>
      </div>
    );
  }

  const rules = complianceResult.rulesEvaluated || [];
  const verifications = verificationState?.verifications || {};
  const summary = getVerificationSummary(complianceResult.inspectionId, rules.length);
  const isSupervisor = activeUser.role === "SUPERVISOR" || activeUser.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("verification.title", "Inspector Verification Cockpit")}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              STEP 6 AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              "verification.subtitle",
              "Human-in-the-loop regulatory review, declaration correction, and immutable audit trail"
            )}
          </p>
        </div>

        {/* Right Action Tools: Role Switcher & Audit Trail */}
        <div className="flex flex-wrap items-center gap-2">
          {/* RBAC Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 px-1.5">
              Role:
            </span>
            <button
              onClick={() => handleRoleChange("OFFICER")}
              className={clsx(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                activeUser.role === "OFFICER"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Officer
            </button>
            <button
              onClick={() => handleRoleChange("SUPERVISOR")}
              className={clsx(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                activeUser.role === "SUPERVISOR"
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Supervisor
            </button>
            <button
              onClick={() => handleRoleChange("ADMIN")}
              className={clsx(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                activeUser.role === "ADMIN"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Admin
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<History className="w-4 h-4 text-emerald-600" />}
            onClick={handleOpenAuditTrail}
          >
            {t("audit.viewTrail", "Audit Trail")}
          </Button>

          <Link href="/reports">
            <Button variant="secondary" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
              {t("nav.reports", "Reports")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block font-bold text-blue-950">
            {locale === "hi" ? "मानव सत्यापन अस्वीकरण" : "Human Officer Verification Notice"}
          </strong>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            {locale === "hi"
              ? "LabelGuard स्वचालित अनुपालन सहायता प्रदान करता है। अंतिम प्रवर्तन निर्णय अधिकृत मानव सत्यापन के अधीन हैं।"
              : "LabelGuard provides automated compliance assistance based on configured legal rules. Final enforcement decisions require authorized human verification."}
          </p>
        </div>
      </div>

      {/* Verification Status Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Applicable Rules</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{rules.length}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Confirmed Compliant</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
            {summary.confirmedCount}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-600">Officer Corrected</span>
          <div className="text-xl font-extrabold text-blue-700 mt-0.5">
            {summary.correctedCount}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">Requires Lab Review</span>
          <div className="text-xl font-extrabold text-amber-700 mt-0.5">
            {summary.requiresReviewCount}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Awaiting Decision</span>
          <div className="text-xl font-extrabold text-slate-600 mt-0.5">
            {summary.pendingCount}
          </div>
        </div>
      </div>

      {/* 12-Column Layout: Evidence Canvas on Left, Rule Verification Cockpit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Interactive Evidence Viewer with Zoom/Pan/Rotate */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <EvidenceViewer
            imageUrl="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1000&q=80"
            productName={complianceResult.productName || "Packaged Commodity"}
            boxes={viewerBoxes}
            selectedBoxId={selectedBoxId}
            onSelectBox={(box) => {
              const rule = rules.find((r) => `box-${r.internalRuleId}` === box.id);
              if (rule) setSelectedEvaluation(rule);
            }}
            ruleBeingChecked={
              selectedEvaluation
                ? `${selectedEvaluation.internalRuleId} (${selectedEvaluation.statutoryReference})`
                : undefined
            }
            surface="back"
          />

          {/* Focused Rule Card Details */}
          {selectedEvaluation && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Active Rule Being Verified:
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {selectedEvaluation.internalRuleId}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedEvaluation.requirement}
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                <span>Statutory Ref: <strong className="text-slate-700">{selectedEvaluation.statutoryReference}</strong></span>
                <span>Version: <strong className="text-slate-700">{selectedEvaluation.ruleVersion}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right 7 Columns: Statutory Rules Verification Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Statutory Declarations Verification Matrix ({rules.length} Rules)
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Inspection: {complianceResult.inspectionId}
            </span>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {rules.map((rule) => {
              const verification = verifications[rule.ruleId];
              const isSelected = selectedEvaluation?.ruleId === rule.ruleId;
              const hasEvidence = !!rule.evidence;

              return (
                <div
                  key={rule.ruleId}
                  onClick={() => setSelectedEvaluation(rule)}
                  className={clsx(
                    "p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:border-blue-300",
                    isSelected
                      ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50/10"
                      : "border-slate-200"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5 max-w-md">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">
                          {rule.internalRuleId}
                        </span>
                        <span className="font-mono text-[11px] text-blue-700 font-semibold">
                          {rule.statutoryReference}
                        </span>
                        {verification && (
                          <span
                            className={clsx(
                              "px-2 py-0.2 rounded-full text-[9px] font-bold tracking-wider uppercase",
                              verification.officerStatus === "CONFIRMED" && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                              verification.officerStatus === "CORRECTED" && "bg-blue-100 text-blue-800 border border-blue-200",
                              verification.officerStatus === "REQUIRES_REVIEW" && "bg-amber-100 text-amber-800 border border-amber-200",
                              verification.officerStatus === "REJECTED" && "bg-red-100 text-red-800 border border-red-200"
                            )}
                          >
                            Officer {verification.officerStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium line-clamp-1">
                        {rule.requirement}
                      </p>
                    </div>

                    {/* Automated Status vs Officer Status */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          AI Engine
                        </span>
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            rule.status === "PASS" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                            rule.status === "FAIL" && "bg-red-50 text-red-700 border border-red-200",
                            rule.status === "REVIEW" && "bg-amber-50 text-amber-700 border border-amber-200",
                            rule.status === "NOT_APPLICABLE" && "bg-slate-50 text-slate-700 border border-slate-200"
                          )}
                        >
                          {rule.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fact & Evidence Row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Detected Fact
                      </span>
                      <div className="font-mono text-slate-900 font-semibold mt-0.5 truncate">
                        {verification?.newValue ? (
                          <span className="text-blue-700">
                            {verification.newValue}{" "}
                            <span className="text-[10px] text-slate-400 line-through">
                              ({rule.extractedValue})
                            </span>
                          </span>
                        ) : (
                          rule.extractedValue || "NOT DETECTED"
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Optical Evidence Trace
                      </span>
                      {hasEvidence ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-600 font-mono text-[11px] truncate">
                            &ldquo;{rule.evidence?.ocrText}&rdquo;
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            {(rule.evidence!.ocrConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          No bounding box token found
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reason & Officer Justification */}
                  <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
                    <strong>Engine Reason:</strong> {rule.reason}
                    {verification && (
                      <div className="mt-1 pt-1 border-t border-slate-200 text-blue-900 font-medium">
                        <strong>Officer Finding ({verification.officer.name}):</strong>{" "}
                        {verification.reason}
                        {verification.note && (
                          <span className="block text-slate-600 italic mt-0.5">
                            Note: {verification.note}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Officer Action Buttons Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(rule, "CONFIRM");
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-700 hover:bg-blue-50 border-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(rule, "CORRECT");
                        }}
                      >
                        Correct Value
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-700 hover:bg-amber-50 border-amber-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(rule, "MARK_FOR_REVIEW");
                        }}
                      >
                        Mark for Review
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-700 hover:bg-red-50 text-[11px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(rule, "REJECT_EVIDENCE");
                        }}
                      >
                        Reject
                      </Button>
                    </div>

                    <a
                      href={rule.sourceReference.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supervisor Final Formal Sign-Off Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">
                    Supervisor Formal Sign-off & Dossier Certification
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Rule 28 Compliance Certification • Requires SUPERVISOR role
                  </span>
                </div>
              </div>

              {verificationState?.supervisorSignoff && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Signed: {verificationState.supervisorSignoff.signatureHash}
                </span>
              )}
            </div>

            {verificationState?.supervisorSignoff ? (
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-1 text-purple-900">
                <div className="font-bold flex items-center gap-1.5 text-purple-950">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Dossier Certified by {verificationState.supervisorSignoff.supervisor.name} (
                  {verificationState.supervisorSignoff.supervisor.role})
                </div>
                <p className="text-[11px] text-purple-800">
                  Remarks: {verificationState.supervisorSignoff.remarks}
                </p>
                <div className="text-[10px] text-purple-700 font-mono pt-1">
                  Timestamp: {new Date(verificationState.supervisorSignoff.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!isSupervisor && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      You are currently viewing as <strong>{activeUser.role}</strong>. Switch to
                      SUPERVISOR or ADMIN using the top role toggle to execute formal sign-off.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Supervisor Certification Remarks:
                  </label>
                  <textarea
                    rows={2}
                    value={supervisorRemarks}
                    onChange={(e) => setSupervisorRemarks(e.target.value)}
                    disabled={!isSupervisor}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isSupervisor || isSigningOff}
                    className="text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => handleSupervisorSignoff(false)}
                  >
                    Flag Violation / Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isSupervisor || isSigningOff}
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={() => handleSupervisorSignoff(true)}
                  >
                    {isSigningOff ? "Signing..." : "Approve & Certify Dossier"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Verification Modal */}
      <OfficerVerificationModal
        isOpen={actionModalOpen}
        evaluation={selectedEvaluation}
        initialAction={modalAction}
        activeUser={activeUser}
        onClose={() => setActionModalOpen(false)}
        onSubmit={handleVerificationSubmit}
      />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={auditModalOpen}
        trail={auditTrail}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
