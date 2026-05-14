// Upstream verdict shapes — minimal, structurally compatible with
// the actual packages but not importing from them.
// PANIM ADAM only reads .level from each.

export type NesherLevel = 'SAFE' | 'CAUTION' | 'CRITICAL' | 'BLOCKED' | 'INDETERMINATE';
export type ShorLevel   = 'GROUNDED' | 'PARTIAL' | 'UNGROUNDED' | 'INDETERMINATE';
export type AryehLevel  = 'IN_SCOPE' | 'BOUNDARY' | 'OUT_OF_SCOPE' | 'INDETERMINATE';

export interface UpstreamVerdicts {
  nesher: { level: NesherLevel; confidence?: number };
  shor:   { level: ShorLevel;   confidence?: number } | null;
  aryeh:  { level: AryehLevel;  confidence?: number } | null;
}

// The five output decisions — INDETERMINATE is the fallback path from the actual code
export type PanimAdamDecision = 'ALLOW' | 'CAUTION' | 'ESCALATE' | 'BLOCK' | 'INDETERMINATE';

// The human-facing recommended action (filed in Beiur report)
export type BeiurRecommendation = 'APPROVE' | 'DENY' | 'DEFER';

// The structured Beiur report — what PANIM ADAM files as reasoning
export interface BeiurReport {
  triggeredBy: Array<{
    chayyah: 'NESHER' | 'SHOR' | 'ARYEH';
    level: string;
    reason: string;
  }>;
  confidenceDelta: number | null;
  recommendation: BeiurRecommendation;
  summary: string;
  filedAt: string;
}

// The full PANIM ADAM output — superset of the atzmutos inline PanimAdamResult
export interface PanimAdamResult {
  decision: PanimAdamDecision;
  reasons: string[];                // human-readable per-chayyah reasons (from actual inline code)
  beiur: BeiurReport | null;        // non-null only when decision === 'ESCALATE'
  reasoning: string;                // compact machine-readable trace, e.g. "NESHER=CRITICAL→ESCALATE"
}
