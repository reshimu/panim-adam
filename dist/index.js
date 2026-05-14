// src/beiur.ts
function buildBeiur(verdicts, action, context) {
  const triggeredBy = [];
  if (verdicts.nesher.level === "CRITICAL") {
    triggeredBy.push({
      chayyah: "NESHER",
      level: "CRITICAL",
      reason: "Action classified as high-risk irreversible operation"
    });
  }
  if (verdicts.shor?.level === "UNGROUNDED") {
    triggeredBy.push({
      chayyah: "SHOR",
      level: "UNGROUNDED",
      reason: "Action references entities that could not be grounded"
    });
  }
  const nesherConfidence = verdicts.nesher.confidence;
  const confidenceDelta = typeof nesherConfidence === "number" ? nesherConfidence - 0.5 : null;
  let recommendation;
  if (triggeredBy.length > 1) {
    recommendation = "DEFER";
  } else if (verdicts.nesher.level === "CRITICAL") {
    recommendation = "DEFER";
  } else if (verdicts.shor?.level === "UNGROUNDED") {
    recommendation = "DENY";
  } else {
    recommendation = "DEFER";
  }
  const triggerReasons = triggeredBy.map((t) => t.reason).join("; ");
  const actionLabel = action || "<unspecified>";
  const summary = `Action '${actionLabel}' triggered escalation: ${triggerReasons}. Human review required before proceeding.`;
  return {
    triggeredBy,
    confidenceDelta,
    recommendation,
    summary,
    filedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/compose.ts
function compose(verdicts, action = "", context) {
  const nesher = verdicts.nesher.level;
  const shor = verdicts.shor?.level ?? null;
  const aryeh = verdicts.aryeh?.level ?? null;
  const reasons = [];
  if (nesher === "BLOCKED") {
    reasons.push(`NESHER: action is explicitly blocked`);
    return {
      decision: "BLOCK",
      reasons,
      beiur: null,
      reasoning: `NESHER=BLOCKED\u2192BLOCK`
    };
  }
  if (aryeh === "OUT_OF_SCOPE") {
    reasons.push(`ARYEH: action is outside the session covenant`);
    return {
      decision: "BLOCK",
      reasons,
      beiur: null,
      reasoning: `ARYEH=OUT_OF_SCOPE\u2192BLOCK`
    };
  }
  if (nesher === "CRITICAL") {
    reasons.push(`NESHER: irreversible or high blast-radius action`);
  }
  if (shor === "UNGROUNDED") {
    reasons.push(`SHOR: output contains ungrounded claims`);
  }
  if (reasons.length > 0) {
    const parts = [];
    if (nesher === "CRITICAL") parts.push(`NESHER=CRITICAL`);
    if (shor === "UNGROUNDED") parts.push(`SHOR=UNGROUNDED`);
    return {
      decision: "ESCALATE",
      reasons,
      beiur: buildBeiur(verdicts, action, context),
      reasoning: `${parts.join("\xB7")}\u2192ESCALATE`
    };
  }
  if (nesher === "CAUTION") {
    reasons.push(`NESHER: action has a rollback path but warrants logging`);
  }
  if (shor === "PARTIAL") {
    reasons.push(`SHOR: some claims could not be grounded in context`);
  }
  if (aryeh === "BOUNDARY") {
    reasons.push(`ARYEH: action is at the edge of the session covenant`);
  }
  if (reasons.length > 0) {
    const parts = [];
    if (nesher === "CAUTION") parts.push(`NESHER=CAUTION`);
    if (shor === "PARTIAL") parts.push(`SHOR=PARTIAL`);
    if (aryeh === "BOUNDARY") parts.push(`ARYEH=BOUNDARY`);
    return {
      decision: "CAUTION",
      reasons,
      beiur: null,
      reasoning: `${parts.join("\xB7")}\u2192CAUTION`
    };
  }
  const nesherClear = nesher === "SAFE";
  const shorClear = shor === null || shor === "GROUNDED";
  const aryehClear = aryeh === null || aryeh === "IN_SCOPE" || aryeh === "INDETERMINATE";
  if (nesherClear && shorClear && aryehClear) {
    reasons.push(`NESHER: ${nesher}`);
    if (shor !== null) reasons.push(`SHOR: ${shor}`);
    if (aryeh !== null && aryeh !== "INDETERMINATE") reasons.push(`ARYEH: ${aryeh}`);
    const parts = [`NESHER=${nesher}`];
    if (shor !== null) parts.push(`SHOR=${shor}`);
    if (aryeh !== null && aryeh !== "INDETERMINATE") parts.push(`ARYEH=${aryeh}`);
    return {
      decision: "ALLOW",
      reasons,
      beiur: null,
      reasoning: `${parts.join("\xB7")}\u2192ALLOW`
    };
  }
  reasons.push(`NESHER=${nesher}`, `SHOR=${shor ?? "skipped"}`, `ARYEH=${aryeh ?? "skipped"}`);
  return {
    decision: "INDETERMINATE",
    reasons,
    beiur: null,
    reasoning: `NESHER=${nesher}\xB7SHOR=${shor ?? "skipped"}\xB7ARYEH=${aryeh ?? "skipped"}\u2192INDETERMINATE`
  };
}

// src/index.ts
var CHAYYAH = "PANIM_ADAM";
var VERSION = "0.1.0";
export {
  CHAYYAH,
  VERSION,
  buildBeiur,
  compose
};
