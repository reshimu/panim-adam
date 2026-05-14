# @reshimu/panim-adam

@reshimu/panim-adam — gray-zone discernment and structured escalation for autonomous agent pipelines

---

## Role in the Chayyot Stack

Fourth of the four Chayyot (Ezekiel's Merkavah). While NESHER, SHOR, and ARYEH each enforce a deterministic predicate, PANIM ADAM activates when those predicates are exhausted — when the action is not clearly blocked but carries conflicting signals that exceed what any single-axis check can resolve. It does not decide; it elucidates. Its output is a structured Beiur report: a receiver-oriented elucidation that enables human judgment rather than substituting for it. This is the doctrinal property the tradition calls bittul — the validator constituted as oriented toward the signal it carries, not toward its own continuation.

---

## Architecture of Velocity

Every organization that has flattened its hierarchy without redesigning its decision interfaces has discovered PANIM ADAM's failure mode: actions that no single governance check blocked, that accumulated into catastrophic drift because no one was performing the gray-zone discernment function. The Chayyot essay identifies PANIM ADAM as the face of the human — not because human judgment is slower or weaker than the other three, but because some decisions are structurally irreducible to predicates. Recognizing that boundary and escalating with a structured elucidation rather than a binary block is itself the alignment work.

---

## Decision Level Table

| Decision      | Condition                                       | Beiur filed |
|---------------|-------------------------------------------------|-------------|
| `BLOCK`       | `NESHER=BLOCKED` or `ARYEH=OUT_OF_SCOPE`        | No          |
| `ESCALATE`    | `NESHER=CRITICAL` or `SHOR=UNGROUNDED`          | Yes         |
| `CAUTION`     | `NESHER=CAUTION`, `SHOR=PARTIAL`, `ARYEH=BOUNDARY` | No       |
| `ALLOW`       | All clear / skipped                             | No          |
| `INDETERMINATE` | Fallback — no rule matched cleanly            | No          |

---

## API Reference

### `compose(verdicts, action?, context?)`

The core composition function. Evaluates upstream Chayyot verdicts against the priority ladder and returns a `PanimAdamResult`.

```typescript
import { compose } from '@reshimu/panim-adam';

const result = compose(
  {
    nesher: { level: 'CRITICAL' },
    shor: null,
    aryeh: null,
  },
  'delete-database',
);
// result.decision === 'ESCALATE'
// result.beiur !== null
// result.reasoning === 'NESHER=CRITICAL→ESCALATE'
```

### `buildBeiur(verdicts, action, context?)`

Generates a structured `BeiurReport` for ESCALATE cases. Called automatically by `compose()` when ESCALATE fires. Can also be called directly to generate a standalone report.

```typescript
import { buildBeiur } from '@reshimu/panim-adam';

const report = buildBeiur(verdicts, 'purge-records');
// report.recommendation === 'DEFER'
// report.triggeredBy[0].chayyah === 'NESHER'
```

---

## Exported Types

| Type | Description |
|------|-------------|
| `UpstreamVerdicts` | Input shape — carries `.level` (and optional `.confidence`) from each Chayyah |
| `NesherLevel` | `'SAFE' \| 'CAUTION' \| 'CRITICAL' \| 'BLOCKED' \| 'INDETERMINATE'` |
| `ShorLevel` | `'GROUNDED' \| 'PARTIAL' \| 'UNGROUNDED' \| 'INDETERMINATE'` |
| `AryehLevel` | `'IN_SCOPE' \| 'BOUNDARY' \| 'OUT_OF_SCOPE' \| 'INDETERMINATE'` |
| `PanimAdamDecision` | `'ALLOW' \| 'CAUTION' \| 'ESCALATE' \| 'BLOCK' \| 'INDETERMINATE'` |
| `PanimAdamResult` | Full output: `decision`, `reasons`, `beiur`, `reasoning` |
| `BeiurReport` | Structured escalation report: `triggeredBy`, `confidenceDelta`, `recommendation`, `summary`, `filedAt` |
| `BeiurRecommendation` | `'APPROVE' \| 'DENY' \| 'DEFER'` |

---

## DECISION: Why compose is extracted rather than inlined

The inline compose logic in `@reshimu/atzmutos` was duplicated across `intercept.ts` and `classify-action.ts` — two callers enforcing the same priority ladder with no shared source of truth. Extracting to `@reshimu/panim-adam` means:

- **Single authority** — the priority ladder has one implementation. Changing it changes it everywhere.
- **Downstream composability** — orchestrators, custom pipelines, and preview tools can import `compose()` directly without pulling in the full atzmutos runtime.
- **Testability** — the composition logic is independently testable with no MCP server, no classifier dependencies, no I/O.
- **Beiur as a first-class artifact** — the `BeiurReport` type is now a stable interface that downstream consumers can inspect, log, and route without parsing freeform strings.

---

## Zero Dependencies

`@reshimu/panim-adam` has no runtime dependencies. Upstream Chayyot verdicts are passed in as plain typed objects. The package does not import `@reshimu/nesher`, `@reshimu/shor`, or `@reshimu/aryeh`.

---

Part of the Reshimu.ai Chayyot integrity stack.  
MIT License.
