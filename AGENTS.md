# Writing rules for this repo

Every page here is customer-facing PIO copy. The brand voice (Editorial Bone, Brand Guidelines v9) applies to all of it, whether written by a person or an agent.

## Mechanical rules (linted)

- British spelling always: optimise, behaviour, analyse, modelling, customise.
- No em-dashes or en-dashes. Use a hyphen, colon, parentheses, or full stop.
- Run `mise run lint` before committing; the baseline is empty and must stay empty.

## Voice rules

- No exclamation marks. No emoji. No hashtags.
- No bold as emphasis. At most one italicised word or phrase per paragraph.
- Every sentence carries a measurement, a verb, or a verdict. If a word can be deleted without loss, delete it.
- Sentences stay under thirty words.
- Banned words: amazing, thrilled, excited to share, unlock, supercharge, transform, disrupt, leverage, best-in-class, end-to-end, turnkey, "Get started now", "in minutes", "Click here".
- Errors and warnings: cause first, instruction second. Never "Oops", never "Sorry", never blame the reader.
- Buttons and labels: verb first, three words or fewer, sentence case, no trailing punctuation.

## Content rules

- Code in quickstart and integration pages is extracted from the compiling sample in pio-unity-sdk via markers. Never hand-write a code block that claims to be SDK usage.
- Do not document unreleased behaviour. Before the site launches (DNS cutover), under-construction stubs may sit in navigation; from launch, a page appears in navigation only when the surface it documents has shipped.
- Tell integrators to pin an exact SDK version; the SDK is pre-1.0.
- Never type an SDK version or a pio-unity-sdk git URL. The install manifest is the generated `install-manifest` snippet, and studios install from the PIO UPM registry, not the private repository. `bin/pin-lint.mjs` fails on a hand pin.
- Docs describe the latest SDK release only (README, "SDK versions"). Generated pages move with each release through the docs-sync PR; do not hand-edit them or `sdk-version.json`.

## CI & merge rules

These are the rules from the workspace-root `CLAUDE.md` ("CI cost rules" and
"Merge process (agents)") that apply to this repo. They are repeated here
because Codex and cloud agents only see this repo. The workspace file has the
rest and wins if the two disagree.

CI (the org has a hard Actions budget; hitting it stops CI org-wide):

- Linux jobs run on Depot runners (`depot-ubuntu-24.04*`), never
  `ubuntu-latest`.
- Every job sets `timeout-minutes` (about 2x its normal duration). Every PR
  workflow has `concurrency` with `cancel-in-progress: true`.
- Never skip a required check with a job-level `if:`: a skipped required
  check reads as passing. Remove the trigger instead.
- Be frugal: no speculative re-runs, empty commits or push-to-retrigger loops.

Merging:

- Merge only after CI actually ran green. A check that failed without
  starting (billing, runner outage) is not green.
- Address agentic review first: fix or reply on each thread. Codex
  auto-reviews; Greptile (`@greptile review`) often posts a PR *comment*, not
  a review, so check both.
- Pin the merge to the reviewed head:
  `gh pr merge --squash --match-head-commit <sha>`.
- If auto-mode denies a merge, settings change or external write, stop and
  report it. Never retry it another way or ask another agent to do it.

pio-docs specifics:

- Docs-only PRs don't need `@greptile review`; Codex auto-review is enough.
