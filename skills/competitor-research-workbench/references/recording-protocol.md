# Workflow recording protocol

Use only when the user explicitly asks to start recording or monitoring their on-screen product use.

## Before observing

- Confirm the named competitor if it is unclear. Do not require the user to state an intended task before recording; infer the task from the first meaningful actions and mark it `unknown` if the session never makes it clear.
- Tell the user that sensitive fields, credentials, private messages, payment details, and unrelated apps should stay off screen.
- Use the Computer Use skill and its required tool flow. Observation does not authorize clicks or data changes beyond the user's requested task.

## During the session

Record meaningful state transitions rather than raw mouse movement. For each step retain:

- sequence number and user goal;
- entry state and action;
- visible system response and result;
- feature/capability used;
- friction, uncertainty, workaround, or delight;
- elapsed time when useful;
- screenshot path and whether the step is directly observed.

Take screenshots at entry, important choices, successful completion, upgrade gates, and failures. Save each screenshot under `public/recordings/<session-id>/` so the local workbench can display it. Use a concise caption that explains what the screenshot proves, and attach the screenshot to every feature and journey step it supports. Avoid collecting unrelated or sensitive information.

## Stop and synthesize

Stop immediately when the user says “结束录制”, “stop recording”, or equivalent. Do not continue monitoring in the background.

Convert the session into:

1. a journey with observed steps and separate inferred motivations;
2. atomic feature nodes merged into the existing framework;
3. friction and opportunity notes tied to specific steps;
4. evidence records for screenshots;
5. workspace JSON following [workspace-schema.md](workspace-schema.md).

For the bundled local workbench, write the review-ready result to `public/recordings/latest.json` and keep screenshot URLs relative to the site root, for example `/recordings/minimax-2026-08-30/step-02.png`. Tell the user to return to the workbench and click **查看最新录制**. The result is a review draft only; do not merge it into the existing framework or journey before the user confirms in the webpage.

If a step was missed or obscured, mark it `inferred` or `unknown`; never reconstruct it as observed fact.
