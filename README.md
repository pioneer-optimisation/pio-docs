# pio-docs

Customer-facing documentation for PIO, published with Mintlify at docs.pioneeroptimisation.com.

## Working locally

- `mise trust && mise install` once after cloning: installs node 22 (the mint CLI refuses non-LTS node) and the pinned mint CLI itself
- `mise run dev` starts the local preview (mint dev)
- `mise run lint` runs the brand copy lint: no em/en-dashes, British spelling (ported from pio-web's brand-lint, ENG-377)

## Rules of the repo

- Prose is written here. Quickstart snippets and the API reference are generated in from pio-unity-sdk and carry do-not-edit headers; regenerate them, never hand-edit.
- Read AGENTS.md before writing any copy. The voice rules are enforced, not advisory.
- Version references pin exact SDK tags. The SDK is pre-1.0; minor releases may break source.
