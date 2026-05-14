type NesherLevel = 'SAFE' | 'CAUTION' | 'CRITICAL' | 'BLOCKED' | 'INDETERMINATE';
type ShorLevel = 'GROUNDED' | 'PARTIAL' | 'UNGROUNDED' | 'INDETERMINATE';
type AryehLevel = 'IN_SCOPE' | 'BOUNDARY' | 'OUT_OF_SCOPE' | 'INDETERMINATE';
interface UpstreamVerdicts {
    nesher: {
        level: NesherLevel;
        confidence?: number;
    };
    shor: {
        level: ShorLevel;
        confidence?: number;
    } | null;
    aryeh: {
        level: AryehLevel;
        confidence?: number;
    } | null;
}
type PanimAdamDecision = 'ALLOW' | 'CAUTION' | 'ESCALATE' | 'BLOCK' | 'INDETERMINATE';
type BeiurRecommendation = 'APPROVE' | 'DENY' | 'DEFER';
interface BeiurReport {
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
interface PanimAdamResult {
    decision: PanimAdamDecision;
    reasons: string[];
    beiur: BeiurReport | null;
    reasoning: string;
}

declare function compose(verdicts: UpstreamVerdicts, action?: string, context?: string): PanimAdamResult;

declare function buildBeiur(verdicts: UpstreamVerdicts, action: string, context?: string): BeiurReport;

declare const CHAYYAH: "PANIM_ADAM";
declare const VERSION: "0.1.0";

export { type AryehLevel, type BeiurRecommendation, type BeiurReport, CHAYYAH, type NesherLevel, type PanimAdamDecision, type PanimAdamResult, type ShorLevel, type UpstreamVerdicts, VERSION, buildBeiur, compose };
