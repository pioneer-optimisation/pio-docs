import assert from "node:assert/strict";
import { test } from "node:test";
import { findings } from "./pin-lint.mjs";
import { verdict, GRACE_HOURS } from "./sdk-version-check.mjs";

const at = (iso, hours) => new Date(Date.parse(iso) + hours * 36e5);

test("docs on the latest release pass", () => {
    const releases = [{ tag: "v0.3.2", publishedAt: "2026-07-28T00:00:00Z" }, { tag: "v0.3.3", publishedAt: "2026-10-03T21:14:11Z" }];
    assert.equal(verdict({ claimed: "0.3.3", releases }).ok, true);
});

test("a newer release passes inside the sync window and fails after it", () => {
    const releases = [{ tag: "v0.3.3", publishedAt: "2026-10-01T00:00:00Z" }, { tag: "v0.3.4", publishedAt: "2026-10-03T00:00:00Z" }];
    assert.equal(verdict({ claimed: "0.3.3", releases, now: at("2026-10-03T00:00:00Z", GRACE_HOURS - 1) }).ok, true);
    assert.equal(verdict({ claimed: "0.3.3", releases, now: at("2026-10-03T00:00:00Z", GRACE_HOURS + 1) }).ok, false);
});

test("a second release does not reset the window for docs already overdue", () => {
    const releases = [
        { tag: "v0.3.3", publishedAt: "2026-10-01T00:00:00Z" },
        { tag: "v0.3.4", publishedAt: "2026-10-02T00:00:00Z" },
        { tag: "v0.3.5", publishedAt: "2026-10-03T23:00:00Z" },
    ];
    const result = verdict({ claimed: "0.3.3", releases, now: at("2026-10-04T00:00:00Z", 0) });
    assert.equal(result.ok, false);
    assert.match(result.message, /v0\.3\.4 shipped 48\.0h ago \(latest v0\.3\.5\)/);
});

test("claiming an unreleased version fails, and semver orders numerically", () => {
    const releases = [{ tag: "v0.3.9", publishedAt: "2026-10-01T00:00:00Z" }, { tag: "v0.3.10", publishedAt: "2026-10-02T00:00:00Z" }];
    assert.equal(verdict({ claimed: "0.4.0", releases }).ok, false);
    assert.equal(verdict({ claimed: "0.3.10", releases }).ok, true);
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

test("SDK versions typed in prose fail", () => {
    for (const prose of ["Upgrade to v0.3.4 first.", "Needs SDK 0.3.4.", "Since version 0.3.4, events carry it."]) {
        assert.deepEqual(findings("page.mdx", prose).map((h) => h.split(" ")[1]), ["[prose-pin]"], prose);
    }
    assert.deepEqual(findings("page.mdx", "Unity 2022.3 LTS, UniTask 2.5.11, vX.Y.Z."), []);
});
