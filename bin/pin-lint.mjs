#!/usr/bin/env node
// Hand-pin gate (ENG-1259). The SDK version shown to studios is generated:
// the install manifest is a snippet rendered from the release tag, and the
// API reference and changelog are generated pages. A version typed by hand
// goes stale on the next release, and a git URL points at a private
// repository studios cannot read. Both fail here.
import fs from "node:fs";
import path from "node:path";

export const RULES = [
    { name: "private-repo", regex: /pio-unity-sdk\.git/g, hint: "studios install from the PIO registry; use the install-manifest snippet" },
    { name: "tag-pin", regex: /#v\d+\.\d+\.\d+/g, hint: "SDK versions come from the install-manifest snippet, never by hand" },
    { name: "manifest-pin", regex: /"com\.pioneeroptimisation\.sdk"\s*:\s*"/g, hint: "use {/* snippet:install-manifest */} instead of a hand-written manifest line" },
];

const GENERATED = /\{\/\* Generated from pio-unity-sdk [^*]*Do not edit here\. \*\/\}/;
const REGION = /\{\/\* snippet:([a-z0-9-]+) \*\/\}[\s\S]*?\{\/\* \/snippet:\1 \*\/\}/g;

export function findings(file, text) {
    if (GENERATED.test(text)) return [];
    // Blank generated regions but keep their newlines, so line numbers hold.
    const prose = text.replace(REGION, (region) => region.replace(/[^\n]/g, " "));
    const out = [];
    for (const rule of RULES) {
        for (const m of prose.matchAll(rule.regex)) {
            const line = prose.slice(0, m.index).split("\n").length;
            out.push(`${file}:${line}: [${rule.name}] "${m[0]}" -> ${rule.hint}`);
        }
    }
    return out;
}

function main() {
    const root = path.join(import.meta.dirname, "..");
    const files = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            if (e.name.startsWith(".") || e.name === "node_modules") continue;
            const p = path.join(dir, e.name);
            if (e.isDirectory()) walk(p);
            else if (/\.mdx?$/.test(e.name)) files.push(p);
        }
    })(root);
    const all = files.sort().flatMap((f) => findings(path.relative(root, f), fs.readFileSync(f, "utf8")));
    if (all.length) {
        console.error(`x pin-lint: ${all.length} hand-written SDK pin(s):`);
        for (const f of all) console.error(`  ${f}`);
        process.exit(1);
    }
    console.log(`pin-lint: clean (${files.length} files)`);
}

if (import.meta.filename === fs.realpathSync(process.argv[1])) main();
