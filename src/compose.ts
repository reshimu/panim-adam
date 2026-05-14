import type { UpstreamVerdicts, PanimAdamResult, NesherLevel, ShorLevel, AryehLevel } from './types.js';
import { buildBeiur } from './beiur.js';

export function compose(
  verdicts: UpstreamVerdicts,
  action = '',
  context?: string,
): PanimAdamResult {
  const nesher = verdicts.nesher.level;
  const shor: ShorLevel | null = verdicts.shor?.level ?? null;
  const aryeh: AryehLevel | null = verdicts.aryeh?.level ?? null;

  const reasons: string[] = [];

  // Hard blocks — no override path
  if (nesher === 'BLOCKED') {
    reasons.push(`NESHER: action is explicitly blocked`);
    return {
      decision: 'BLOCK',
      reasons,
      beiur: null,
      reasoning: `NESHER=BLOCKED→BLOCK`,
    };
  }
  if (aryeh === 'OUT_OF_SCOPE') {
    reasons.push(`ARYEH: action is outside the session covenant`);
    return {
      decision: 'BLOCK',
      reasons,
      beiur: null,
      reasoning: `ARYEH=OUT_OF_SCOPE→BLOCK`,
    };
  }

  // Escalate — halt for human review
  if (nesher === 'CRITICAL') {
    reasons.push(`NESHER: irreversible or high blast-radius action`);
  }
  if (shor === 'UNGROUNDED') {
    reasons.push(`SHOR: output contains ungrounded claims`);
  }
  if (reasons.length > 0) {
    const parts: string[] = [];
    if (nesher === 'CRITICAL') parts.push(`NESHER=CRITICAL`);
    if (shor === 'UNGROUNDED') parts.push(`SHOR=UNGROUNDED`);
    return {
      decision: 'ESCALATE',
      reasons,
      beiur: buildBeiur(verdicts, action, context),
      reasoning: `${parts.join('·')}→ESCALATE`,
    };
  }

  // Caution — proceed with logging
  if (nesher === 'CAUTION') {
    reasons.push(`NESHER: action has a rollback path but warrants logging`);
  }
  if (shor === 'PARTIAL') {
    reasons.push(`SHOR: some claims could not be grounded in context`);
  }
  if (aryeh === 'BOUNDARY') {
    reasons.push(`ARYEH: action is at the edge of the session covenant`);
  }
  if (reasons.length > 0) {
    const parts: string[] = [];
    if (nesher === 'CAUTION') parts.push(`NESHER=CAUTION`);
    if (shor === 'PARTIAL') parts.push(`SHOR=PARTIAL`);
    if (aryeh === 'BOUNDARY') parts.push(`ARYEH=BOUNDARY`);
    return {
      decision: 'CAUTION',
      reasons,
      beiur: null,
      reasoning: `${parts.join('·')}→CAUTION`,
    };
  }

  // Allow — all clear
  const nesherClear = nesher === 'SAFE';
  const shorClear = shor === null || shor === 'GROUNDED';
  const aryehClear = aryeh === null || aryeh === 'IN_SCOPE' || aryeh === 'INDETERMINATE';

  if (nesherClear && shorClear && aryehClear) {
    reasons.push(`NESHER: ${nesher}`);
    if (shor !== null) reasons.push(`SHOR: ${shor}`);
    if (aryeh !== null && aryeh !== 'INDETERMINATE') reasons.push(`ARYEH: ${aryeh}`);
    const parts: string[] = [`NESHER=${nesher}`];
    if (shor !== null) parts.push(`SHOR=${shor}`);
    if (aryeh !== null && aryeh !== 'INDETERMINATE') parts.push(`ARYEH=${aryeh}`);
    return {
      decision: 'ALLOW',
      reasons,
      beiur: null,
      reasoning: `${parts.join('·')}→ALLOW`,
    };
  }

  // Fallback — matches actual inline code behavior
  reasons.push(`NESHER=${nesher}`, `SHOR=${shor ?? 'skipped'}`, `ARYEH=${aryeh ?? 'skipped'}`);
  return {
    decision: 'INDETERMINATE',
    reasons,
    beiur: null,
    reasoning: `NESHER=${nesher}·SHOR=${shor ?? 'skipped'}·ARYEH=${aryeh ?? 'skipped'}→INDETERMINATE`,
  };
}
