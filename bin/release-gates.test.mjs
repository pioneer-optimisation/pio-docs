import assert from "node:assert/strict";
import { test } from "node:test";
import { findings } from "./pin-lint.mjs";
import { verdict, GRACE_HOURS } from "./sdk-version-check.mjs";

test("docs on the latest release pass", () => {
    assert.equal(verdict({ claimed: "0.3.3", latest: "v0.3.3", publishedAt: "2026-10-03T21:14:11Z" }).ok, true);
});

test("a newer release passes inside the sync window and fails after it", () => {
    const publishedAt = "2026-10-03T00:00:00Z";
    const inside = new Date(Date.parse(publishedAt) + (GRACE_HOURS - 1) * 36e5);
    const after = new Date(Date.parse(publishedAt) + (GRACE_HOURS + 1) * 36e5);
    assert.equal(verdict({ claimed: "0.3.3", latest: "v0.3.4", publishedAt, now: inside }).ok, true);
    assert.equal(verdict({ claimed: "0.3.3", latest: "v0.3.4", publishedAt, now: after }).ok, false);
});

test("claiming an unreleased version fails", () => {
    assert.equal(verdict({ claimed: "0.4.0", latest: "v0.3.10", publishedAt: "2026-10-03T00:00:00Z" }).ok, false);
});

test("hand pins fail; generated regions and generated pages do not", () => {
    const hand = 'x\n"com.pioneeroptimisation.sdk": "https://github.com/pioneer-optimisation/pio-unity-sdk.git#v0.3.2"\n';
    const hits = findings("page.mdx", hand);
    assert.deepEqual(hits.map((h) => h.split(" ")[1]), ["[private-repo]", "[tag-pin]", "[manifest-pin]"]);
    assert.ok(hits[0].startsWith("page.mdx:2:"));
    const region = '{/* snippet:install-manifest */}\n"com.pioneeroptimisation.sdk": "0.3.3"\n{/* /snippet:install-manifest */}\n';
    assert.deepEqual(findings("page.mdx", region), []);
    const generated = '{/* Generated from pio-unity-sdk CHANGELOG.md (v0.3.3) by scripts/changelog-to-docs.mjs. Do not edit here. */}\n#v0.3.2\n';
    assert.deepEqual(findings("changelog.mdx", generated), []);
});
