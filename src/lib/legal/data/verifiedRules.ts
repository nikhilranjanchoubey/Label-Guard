import { LegalRule } from "../types";
import rawRules from "../../../../data/legal/rules.json";

export const VERIFIED_RULES_DATA: LegalRule[] = rawRules as unknown as LegalRule[];
