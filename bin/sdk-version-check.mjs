#!/usr/bin/env node
// Release lag gate (ENG-1259). sdk-version.json names the SDK release these
// docs describe; pio-unity-sdk docs-sync.yml opens a PR moving it to each new
// release. This fails when the docs claim a version that was never released,
// or when they still describe an older release more than GRACE_HOURS after
// the first newer one shipped: the sync PR is stuck and studios are reading
// stale install instructions.
//
//   GH_TOKEN=<token with read on pio-unity-sdk> node bin/sdk-version-check.mjs
import fs from "node:fs";
import path from "node:path";

export const GRACE_HOURS = 24;

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;
const semver = (v) => v.match(SEMVER).slice(1).map(Number);
const cmp = (a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
};

// releases: [{ tag, publishedAt }], published (non-draft, non-prerelease).
// Returns { ok, message }.
export function verdict({ claimed, releases, now = new Date() }) {
    const tagged = releases.filter((r) => SEMVER.test(r.tag))
        .map((r) => ({ ...r, v: semver(r.tag) }))
        .sort((a, b) => cmp(a.v, b.v));
    if (!tagged.length) return { ok: false, message: "no published SDK releases found" };
    const latest = tagged.at(-1);
    const order = cmp(semver(claimed), latest.v);
    if (order === 0) return { ok: true, message: `docs describe the latest SDK release, v${claimed}` };
    if (order > 0) return { ok: false, message: `docs claim v${claimed}, but the latest SDK release is ${latest.tag}` };
    // The window runs from the first release the docs missed, so a second
    // release cannot reset the clock on docs that are already overdue.
    const missed = tagged.find((r) => cmp(r.v, semver(claimed)) > 0);
    const hours = (now - new Date(missed.publishedAt)) / 36e5;
    const lag = `docs describe v${claimed}; ${missed.tag} shipped ${hours.toFixed(1)}h ago (latest ${latest.tag})`;
    if (hours <= GRACE_HOURS) return { ok: true, message: `${lag}, within the ${GRACE_HOURS}h sync window` };
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
    const res = await fetch("https://api.github.com/repos/pioneer-optimisation/pio-unity-sdk/releases?per_page=100", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
        console.error(`sdk-version-check: GitHub API ${res.status} listing SDK releases`);
        process.exit(2);
    }
    const releases = (await res.json())
        .filter((r) => !r.draft && !r.prerelease && r.published_at)
        .map((r) => ({ tag: r.tag_name, publishedAt: r.published_at }));
    const result = verdict({ claimed, releases });
    (result.ok ? console.log : console.error)(`sdk-version-check: ${result.message}`);
    process.exit(result.ok ? 0 : 1);
}

if (import.meta.filename === fs.realpathSync(process.argv[1])) await main();
