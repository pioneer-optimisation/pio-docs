# pio-docs

Customer-facing documentation for PIO, published with Mintlify at docs.pioneeroptimisation.com.

## Working locally

- `mise trust && mise install` once after cloning: installs node 22 (the mint CLI refuses non-LTS node) and the pinned mint CLI itself
- `mise run dev` starts the local preview (mint dev)
- `mise run lint` runs the brand copy lint (no em/en-dashes, British spelling; ported from pio-web's brand-lint, ENG-377) and the hand-pin lint

## Rules of the repo

- Prose is written here. Snippets, the install manifest, the API reference and the changelog are generated in from pio-unity-sdk and carry do-not-edit markers; regenerate them, never hand-edit.
- Read AGENTS.md before writing any copy. The voice rules are enforced, not advisory.
- Never type an SDK version or a pio-unity-sdk git URL. Studios install from the PIO UPM registry, and the version comes from the generated install manifest (`bin/pin-lint.mjs` enforces this).

## SDK versions (ENG-1259)

One version policy: until SDK 1.0, these docs describe the latest SDK release only. There are no per-version copies. Studios on an older release read the changelog entries between their version and the latest. Before 1.0 every minor release may break source, so a per-version copy would mean a copy almost every release, and an old copy could not be regenerated from a sample that still compiles. At 1.0, switch on Mintlify `versions` per major (current and previous).

How a release reaches the docs:

1. release-please tags pio-unity-sdk and `publish.yml` publishes to the UPM registry.
2. Once the registry serves the version, `docs-sync.yml` runs `scripts/docs-sync.mjs --ref vX.Y.Z` and opens a PR here on `bot/sdk-docs-sync-vX.Y.Z`. It regenerates snippets, the install manifest, `api-reference/index.mdx`, `changelog/unity-sdk.mdx` and `sdk-version.json` (the release these docs claim).
3. `drift.yml` checks the PR: generated content must match the claimed tag exactly, and the claim must be the latest release.

Re-sync by hand from a pio-unity-sdk checkout: `mise run docs-sync -- --docs ../pio-docs --ref vX.Y.Z`.

`drift.yml` runs on every PR and daily. It fails when generated content differs from the claimed release, when a newer SDK release has been out for over 24 hours without its sync PR merged, or when a version is pinned by hand. Prose for an unreleased SDK feature waits until that release: a snippet marker the release does not ship fails the check.
