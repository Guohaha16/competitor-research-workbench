---
name: competitor-research-workbench
description: Research market competitors from public evidence and hands-on workflows, maintain a sourced feature framework and user journeys, and turn findings into a prioritized product proposal. Use for competitor research, product teardowns, feature comparisons, workflow recording, or updating the bundled local research workbench.
---

# Competitor Research Workbench

Build a cumulative evidence base, not a one-off prose report. Keep public research, manual observations, and recorded product behavior in one compatible structure so later sessions can extend earlier work.

## Choose the mode

- **New research or refresh:** Read [references/research-protocol.md](references/research-protocol.md), browse current public sources, capture useful screenshots, and build or update the product profile and feature framework.
- **Manual quick input:** Parse the user's rough notes into atomic features. Preserve their wording as an observation, mark unsupported additions as inferred, and ask only when product identity is ambiguous.
- **Workflow recording:** Read [references/recording-protocol.md](references/recording-protocol.md). Use Computer Use only after the user explicitly starts recording. Observe the named product and stop when the user says to stop.
- **Proposal design:** Work from the feature framework, not from memory. Help select features, assign P0/P1/P2, record rationale and dependencies, and identify what must be validated before commitment.
- **Workbench import/export:** Read [references/workspace-schema.md](references/workspace-schema.md). Produce JSON compatible with the bundled local interface and validate it with `scripts/validate_workspace.py`.

## Shared rules

1. Separate **observed fact**, **source claim**, and **inference**. Never upgrade an inference to a fact because multiple secondary sources repeat it.
2. Attach a source URL and access date to public claims. For product UI evidence, attach the screenshot path and the action that produced it.
3. Prefer atomic user-visible capabilities. Use `domain > capability > feature` for the framework; do not mix marketing claims, implementation details, outcomes, and features at one level.
4. Merge synonyms only when the user goal and behavior are equivalent. Keep meaningful differences as variants.
5. Note missing evidence explicitly. Coverage and confidence are more useful than false completeness.
6. Summaries must include positioning, target users/jobs, business model when evidenced, differentiators, feature framework, journey findings, gaps, risks, and likely direction. Label future trends as inference and give the signals behind them.
7. Do not sign in, purchase, publish, invite people, or change account settings unless the user separately authorizes that action.

## Local workbench

The interface lives at the repository root, two directories above this skill. Run `npm run dev` there and open the exact local URL printed by the server. The workbench saves confirmed content locally in the browser. For workflow recording, save a review draft to `public/recordings/latest.json` and its screenshots under `public/recordings/<session-id>/`; the user can then click **查看最新录制** and review everything visually. Manual JSON selection remains a fallback, not the primary handoff.

When completing a meaningful update, return:

- a concise finding summary with confidence and open questions;
- the updated feature framework and journey changes;
- paths to screenshots or other artifacts;
- a validated workspace JSON when the user wants the UI updated.
