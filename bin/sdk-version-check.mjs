#!/usr/bin/env node
// Release lag gate (ENG-1259). sdk-version.json names the SDK release these
// docs describe; pio-unity-sdk docs-sync.yml opens a PR moving it to each new
// release, and that PR merges itself on green. This fails when the docs claim
// a version that was never released, or when they still describe an older
// release more than GRACE_HOURS after a newer one shipped: the sync PR is
// stuck and studios are reading stale install instructions.
//
//   GH_TOKEN=<token with read on pio-unity-sdk> node bin/sdk-version-check
import fs from "node:fs";
import path from "node:path";

export const GRACE_HOURS = 24;

const semver = (v) => v.replace(/^v/, "").split(".").map(Number);
const cmp = (a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
};

// Returns { ok, message }.
export function verdict({ claimed, latest, publishedAt, now = new Date() }) {
    const order = cmp(semver(claimed), semver(latest));
    if (order === 0) return { ok: true, message: `docs describe the latest SDK release, v${claimed}` };
    if (order > 0) return { ok: false, message: `docs claim v${claimed}, but the latest SDK release is ${latest}` };
    const hours = (now - new Date(publishedAt)) / 36e5;
    const lag = `docs describe v${claimed}; ${latest} shipped ${hours.toFixed(1)}h ago`;
    if (hours <= GRACE_HOURS) return { ok: true, message: `${lag} (within the ${GRACE_HOURS}h sync window)` };
    return { ok: false, message: `${lag}; merge or fix the docs-sync PR (pio-unity-sdk docs-sync.yml)` };
}

async function main() {
    const root = path.join(import.meta.dirname, "..");
    const claimed = JSON.parse(fs.readFileSync(path.join(root, "sdk-version.json"), "utf8")).version;
    const token = process.env.GH_TOKEN;
    if (!token) {
        console.error("sdk-version-check: GH_TOKEN with read access to pio-unity-sdk is required");
        process.exit(2);
    }
    const res = await fetch("https://api.github.com/repos/pioneer-optimisation/pio-unity-sdk/releases/latest", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
        console.error(`sdk-version-check: GitHub API ${res.status} reading the latest SDK release`);
        process.exit(2);
    }
    const release = await res.json();
    const result = verdict({ claimed, latest: release.tag_name, publishedAt: release.published_at });
    (result.ok ? console.log : console.error)(`sdk-version-check: ${result.message}`);
    process.exit(result.ok ? 0 : 1);
}

if (import.meta.filename === fs.realpathSync(process.argv[1])) await main();
