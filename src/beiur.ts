import type { UpstreamVerdicts, BeiurReport, BeiurRecommendation } from './types.js';

export function buildBeiur(
  verdicts: UpstreamVerdicts,
  action: string,
  context?: string,
): BeiurReport {
  const triggeredBy: BeiurReport['triggeredBy'] = [];

  if (verdicts.nesher.level === 'CRITICAL') {
    triggeredBy.push({
      chayyah: 'NESHER',
      level: 'CRITICAL',
      reason: 'Action classified as high-risk irreversible operation',
    });
  }

  if (verdicts.shor?.level === 'UNGROUNDED') {
    triggeredBy.push({
      chayyah: 'SHOR',
      level: 'UNGROUNDED',
      reason: 'Action references entities that could not be grounded',
    });
  }

  const nesherConfidence = verdicts.nesher.confidence;
  const confidenceDelta =
    typeof nesherConfidence === 'number' ? nesherConfidence - 0.5 : null;

  let recommendation: BeiurRecommendation;
  if (triggeredBy.length > 1) {
    recommendation = 'DEFER';
  } else if (verdicts.nesher.level === 'CRITICAL') {
    recommendation = 'DEFER';
  } else if (verdicts.shor?.level === 'UNGROUNDED') {
    recommendation = 'DENY';
  } else {
    recommendation = 'DEFER';
  }

  const triggerReasons = triggeredBy.map((t) => t.reason).join('; ');
  const actionLabel = action || '<unspecified>';
  const summary =
    `Action '${actionLabel}' triggered escalation: ${triggerReasons}. ` +
    `Human review required before proceeding.`;

  return {
    triggeredBy,
    confidenceDelta,
    recommendation,
    summary,
    filedAt: new Date().toISOString(),
  };
}
