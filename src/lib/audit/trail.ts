/**
 * LabelGuard — Append-Only Audit Trail Engine
 * Step 6: Immutable event logging with cryptographic hash chaining.
 */

import { AuditAction, AuditEntity, AuditEvent, AuditTrail, AuditUser } from "./types";

const AUDIT_STORAGE_PREFIX = "labelguard_audit_trail_";
const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Fast deterministic hash function compatible with both Node and Browser environments.
 * Uses a 32-bit FNV-1a / Murmur hybrid expanded to 64-hex chars for non-repudiation simulation.
 */
export function computeEventHash(
  previousHash: string,
  eventId: string,
  timestamp: string,
  userId: string,
  action: string,
  entityId: string,
  stateString: string,
  reason: string
): string {
  const payload = `${previousHash}|${eventId}|${timestamp}|${userId}|${action}|${entityId}|${stateString}|${reason}`;
  
  let h1 = 0x811c9dc5;
  let h2 = 0x27d4eb2f;
  let h3 = 0x4f6c8211;
  let h4 = 0x9e3779b9;

  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ ch, 0x5bd1e995);
    h3 = Math.imul(h3 ^ (ch << 3), 0xcc9e2d51);
    h4 = Math.imul(h4 ^ (ch >> 2), 0x1b873593);
  }

  const p1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const p2 = (h2 >>> 0).toString(16).padStart(8, "0");
  const p3 = (h3 >>> 0).toString(16).padStart(8, "0");
  const p4 = (h4 >>> 0).toString(16).padStart(8, "0");
  const p5 = ((h1 ^ h3) >>> 0).toString(16).padStart(8, "0");
  const p6 = ((h2 ^ h4) >>> 0).toString(16).padStart(8, "0");
  const p7 = ((h1 + h2) >>> 0).toString(16).padStart(8, "0");
  const p8 = ((h3 + h4) >>> 0).toString(16).padStart(8, "0");

  return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}`.toLowerCase();
}

export class AuditTrailService {
  private inMemoryStore: Map<string, AuditEvent[]> = new Map();

  /**
   * Append an immutable event to the audit trail for an inspection.
   */
  public logEvent(
    inspectionId: string,
    user: AuditUser,
    action: AuditAction,
    entity: AuditEntity,
    options: {
      previousState?: unknown;
      newState?: unknown;
      reason?: string;
      metadata?: Record<string, unknown>;
      customTimestamp?: string;
    } = {}
  ): AuditEvent {
    const events = this.getEvents(inspectionId);
    const previousHash = events.length > 0 ? events[events.length - 1].hash : GENESIS_HASH;
    const eventId = `AUD-${Date.now()}-${String(events.length + 1).padStart(4, "0")}`;
    const timestamp = options.customTimestamp || new Date().toISOString();
    const reason = options.reason || "";
    const stateStr = JSON.stringify(options.newState || null);

    const hash = computeEventHash(
      previousHash,
      eventId,
      timestamp,
      user.id,
      action,
      entity.id,
      stateStr,
      reason
    );

    const newEvent: AuditEvent = {
      eventId,
      inspectionId,
      timestamp,
      user,
      action,
      entity,
      previousState: options.previousState,
      newState: options.newState,
      reason: options.reason,
      metadata: options.metadata,
      previousHash,
      hash,
    };

    events.push(newEvent);
    this.inMemoryStore.set(inspectionId, events);

    // Save to browser session storage if running on client
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(
          `${AUDIT_STORAGE_PREFIX}${inspectionId}`,
          JSON.stringify(events)
        );
      } catch (e) {
        console.warn("[AuditTrail] Session storage persistence failed:", e);
      }
    }

    return newEvent;
  }

  /**
   * Retrieve all audit events for an inspection.
   */
  public getEvents(inspectionId: string): AuditEvent[] {
    let events = this.inMemoryStore.get(inspectionId);
    if (!events && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(`${AUDIT_STORAGE_PREFIX}${inspectionId}`);
        if (raw) {
          events = JSON.parse(raw);
          if (events && Array.isArray(events)) {
            this.inMemoryStore.set(inspectionId, events);
          }
        }
      } catch (e) {
        console.warn("[AuditTrail] Failed reading from session storage:", e);
      }
    }
    return events ? [...events] : [];
  }

  /**
   * Retrieve the complete audit trail record with cryptographic verification.
   */
  public getAuditTrail(inspectionId: string): AuditTrail {
    const events = this.getEvents(inspectionId);
    const verification = this.verifyIntegrity(events);

    return {
      inspectionId,
      events,
      genesisHash: GENESIS_HASH,
      currentHash: events.length > 0 ? events[events.length - 1].hash : GENESIS_HASH,
      isTamperEvident: verification.valid,
      totalEvents: events.length,
      lastUpdated: events.length > 0 ? events[events.length - 1].timestamp : new Date().toISOString(),
    };
  }

  /**
   * Verify mathematical integrity of the append-only hash chain.
   */
  public verifyIntegrity(events: AuditEvent[]): { valid: boolean; brokenAt?: number; reason?: string } {
    if (events.length === 0) {
      return { valid: true };
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedPrevHash = i === 0 ? GENESIS_HASH : events[i - 1].hash;

      if (event.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          brokenAt: i,
          reason: `Event ${event.eventId} has invalid previousHash (expected ${expectedPrevHash}, got ${event.previousHash})`,
        };
      }

      const calculatedHash = computeEventHash(
        event.previousHash,
        event.eventId,
        event.timestamp,
        event.user.id,
        event.action,
        event.entity.id,
        JSON.stringify(event.newState || null),
        event.reason || ""
      );

      if (event.hash !== calculatedHash) {
        return {
          valid: false,
          brokenAt: i,
          reason: `Event ${event.eventId} signature verification failed (calculated ${calculatedHash}, got ${event.hash})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Clear trail (testing/demo reset only).
   */
  public clear(inspectionId?: string): void {
    if (inspectionId) {
      this.inMemoryStore.delete(inspectionId);
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(`${AUDIT_STORAGE_PREFIX}${inspectionId}`);
      }
    } else {
      this.inMemoryStore.clear();
    }
  }
}

export const auditTrailService = new AuditTrailService();
