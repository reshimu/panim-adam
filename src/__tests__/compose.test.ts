import { describe, it, expect } from 'vitest';
import { compose } from '../compose.js';
import { buildBeiur } from '../beiur.js';
import type { UpstreamVerdicts } from '../types.js';

// ── compose() tests ───────────────────────────────────────────────────────────

describe('compose()', () => {
  it('ALLOW — NESHER=SAFE, SHOR=GROUNDED, ARYEH=IN_SCOPE', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'GROUNDED' },
      aryeh: { level: 'IN_SCOPE' },
    };
    const r = compose(v);
    expect(r.decision).toBe('ALLOW');
    expect(r.beiur).toBeNull();
  });

  it('ALLOW — NESHER=SAFE, SHOR null (skipped), ARYEH null (skipped)', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: null,
      aryeh: null,
    };
    const r = compose(v);
    expect(r.decision).toBe('ALLOW');
    expect(r.beiur).toBeNull();
  });

  it('CAUTION — NESHER=CAUTION', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'CAUTION' },
      shor: null,
      aryeh: null,
    };
    const r = compose(v);
    expect(r.decision).toBe('CAUTION');
    expect(r.beiur).toBeNull();
  });

  it('CAUTION — SHOR=PARTIAL', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'PARTIAL' },
      aryeh: null,
    };
    const r = compose(v);
    expect(r.decision).toBe('CAUTION');
    expect(r.beiur).toBeNull();
  });

  it('CAUTION — ARYEH=BOUNDARY', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: null,
      aryeh: { level: 'BOUNDARY' },
    };
    const r = compose(v);
    expect(r.decision).toBe('CAUTION');
    expect(r.beiur).toBeNull();
  });

  it('ESCALATE — NESHER=CRITICAL', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'CRITICAL' },
      shor: null,
      aryeh: null,
    };
    const r = compose(v, 'delete-database');
    expect(r.decision).toBe('ESCALATE');
    expect(r.beiur).not.toBeNull();
  });

  it('ESCALATE — SHOR=UNGROUNDED', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'UNGROUNDED' },
      aryeh: null,
    };
    const r = compose(v, 'send-email');
    expect(r.decision).toBe('ESCALATE');
    expect(r.beiur).not.toBeNull();
  });

  it('BLOCK — NESHER=BLOCKED', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'BLOCKED' },
      shor: null,
      aryeh: null,
    };
    const r = compose(v);
    expect(r.decision).toBe('BLOCK');
    expect(r.beiur).toBeNull();
  });

  it('BLOCK — ARYEH=OUT_OF_SCOPE', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: null,
      aryeh: { level: 'OUT_OF_SCOPE' },
    };
    const r = compose(v);
    expect(r.decision).toBe('BLOCK');
    expect(r.beiur).toBeNull();
  });

  it('BLOCK wins over ESCALATE — NESHER=BLOCKED + SHOR=UNGROUNDED', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'BLOCKED' },
      shor: { level: 'UNGROUNDED' },
      aryeh: null,
    };
    const r = compose(v);
    expect(r.decision).toBe('BLOCK');
    expect(r.beiur).toBeNull();
  });

  it('reasoning string — ALLOW with all three', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'GROUNDED' },
      aryeh: { level: 'IN_SCOPE' },
    };
    const r = compose(v);
    expect(r.reasoning).toBe('NESHER=SAFE·SHOR=GROUNDED·ARYEH=IN_SCOPE→ALLOW');
  });

  it('reasoning string — CAUTION', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CAUTION' }, shor: null, aryeh: null };
    const r = compose(v);
    expect(r.reasoning).toBe('NESHER=CAUTION→CAUTION');
  });

  it('reasoning string — ESCALATE', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CRITICAL' }, shor: null, aryeh: null };
    const r = compose(v);
    expect(r.reasoning).toBe('NESHER=CRITICAL→ESCALATE');
  });

  it('reasoning string — BLOCK by ARYEH', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: null,
      aryeh: { level: 'OUT_OF_SCOPE' },
    };
    const r = compose(v);
    expect(r.reasoning).toBe('ARYEH=OUT_OF_SCOPE→BLOCK');
  });
});

// ── buildBeiur() tests ────────────────────────────────────────────────────────

describe('buildBeiur()', () => {
  it('NESHER=CRITICAL → triggeredBy includes NESHER entry', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CRITICAL' }, shor: null, aryeh: null };
    const b = buildBeiur(v, 'drop-table');
    expect(b.triggeredBy).toHaveLength(1);
    expect(b.triggeredBy[0].chayyah).toBe('NESHER');
    expect(b.triggeredBy[0].level).toBe('CRITICAL');
  });

  it('SHOR=UNGROUNDED → triggeredBy includes SHOR entry', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'UNGROUNDED' },
      aryeh: null,
    };
    const b = buildBeiur(v, 'send-report');
    expect(b.triggeredBy).toHaveLength(1);
    expect(b.triggeredBy[0].chayyah).toBe('SHOR');
    expect(b.triggeredBy[0].level).toBe('UNGROUNDED');
  });

  it('both CRITICAL and UNGROUNDED → two entries, recommendation DEFER', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'CRITICAL' },
      shor: { level: 'UNGROUNDED' },
      aryeh: null,
    };
    const b = buildBeiur(v, 'deploy-prod');
    expect(b.triggeredBy).toHaveLength(2);
    expect(b.recommendation).toBe('DEFER');
  });

  it('filedAt is a valid ISO timestamp', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CRITICAL' }, shor: null, aryeh: null };
    const b = buildBeiur(v, 'test-action');
    expect(() => new Date(b.filedAt)).not.toThrow();
    expect(new Date(b.filedAt).toISOString()).toBe(b.filedAt);
  });

  it('summary includes the action string', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CRITICAL' }, shor: null, aryeh: null };
    const b = buildBeiur(v, 'purge-records');
    expect(b.summary).toContain('purge-records');
  });

  it('confidenceDelta is null when no confidence provided', () => {
    const v: UpstreamVerdicts = { nesher: { level: 'CRITICAL' }, shor: null, aryeh: null };
    const b = buildBeiur(v, 'action');
    expect(b.confidenceDelta).toBeNull();
  });

  it('confidenceDelta is confidence - 0.5 when confidence provided', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'CRITICAL', confidence: 0.9 },
      shor: null,
      aryeh: null,
    };
    const b = buildBeiur(v, 'action');
    expect(b.confidenceDelta).toBeCloseTo(0.4);
  });

  it('SHOR=UNGROUNDED alone → recommendation DENY', () => {
    const v: UpstreamVerdicts = {
      nesher: { level: 'SAFE' },
      shor: { level: 'UNGROUNDED' },
      aryeh: null,
    };
    const b = buildBeiur(v, 'action');
    expect(b.recommendation).toBe('DENY');
  });
});
