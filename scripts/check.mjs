#!/usr/bin/env node
// Pack consistency check. Run from the repo root: node scripts/check.mjs
// Catches version drift, bad checksums, missing shell files, broken skill links, and JS syntax errors.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join, dirname, relative } from 'node:path'

const root = join(dirname(new URL(import.meta.url).pathname), '..')
const skills = join(root, 'skills')
const assets = join(skills, 'pb-build/assets')
const errors = []
const fail = (msg) => errors.push(msg)
const read = (p) => readFileSync(p, 'utf8')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'vendor') walk(p, out) } else out.push(p)
  }
  return out
}
const files = walk(skills)
const text = files.filter((f) => /\.(md|js|html|json|webmanifest|toml|yaml)$|Dockerfile$/.test(f))

// 1. Vendored files match their sha256 pins.
const pins = JSON.parse(read(join(assets, 'vendor/VERSIONS.json')))
for (const lib of pins.libs) {
  for (const f of lib.files) {
    const p = join(assets, f.to)
    if (!existsSync(p)) { fail(`missing vendored file ${f.to}`); continue }
    const sha = createHash('sha256').update(readFileSync(p)).digest('hex')
    if (sha !== f.sha256) fail(`sha256 mismatch: ${f.to}`)
  }
}

// 2. Every versioned vendor path in docs and starter uses the pinned version.
const want = Object.fromEntries(pins.libs.flatMap((l) => l.files.map((f) => f.to.split('/')[1])).map((d) => [d.replace(/-[\d.]+$/, ''), d]))
for (const f of text) {
  for (const m of read(f).matchAll(/\b(basecoat|pocketbase|tailwind-browser)-(\d+\.\d+\.\d+)\//g)) {
    if (`${m[1]}-${m[2]}` !== want[m[1]]) fail(`${relative(root, f)}: ${m[1]}-${m[2]} but VERSIONS.json pins ${want[m[1]]}`)
  }
}

// 3. Dockerfile server pin matches VERSIONS.json.
const docker = read(join(assets, 'root/Dockerfile'))
const arg = (n) => (docker.match(new RegExp(`ARG ${n}=(\\S+)`)) || [])[1]
if (arg('PB_VERSION') !== pins.server.version) fail(`Dockerfile PB_VERSION ${arg('PB_VERSION')} != ${pins.server.version}`)
for (const a of ['amd64', 'arm64']) if (arg(`PB_SHA256_${a}`) !== pins.server.zips[`linux_${a}`]) fail(`Dockerfile PB_SHA256_${a} != VERSIONS.json`)

// 4. Every file in the service worker SHELL exists in the starter.
const shell = [...read(join(assets, 'sw.js')).matchAll(/^\s+'(\/[^']*)',$/gm)].map((m) => m[1])
for (const u of shell) if (u !== '/' && !existsSync(join(assets, u))) fail(`sw.js SHELL lists ${u}, not in the starter`)

// 5. Skill links resolve: `references/x.md`, `pb-build/references/x.md`, and bare `x.md` (a sibling file).
const names = readdirSync(skills)
const projectFiles = /^(PRODUCT|DESIGN|README|AGENTS|CLAUDE)\.md$/ // written into the user's project, not the pack
for (const f of files.filter((f) => f.endsWith('.md'))) {
  const own = relative(skills, f).split('/')[0]
  for (const m of read(f).matchAll(/`((?:pb-[a-z]+\/)?(?:references|assets)\/[\w./-]+\.\w+)`/g)) {
    const first = m[1].split('/')[0]
    if (!existsSync(names.includes(first) ? join(skills, m[1]) : join(skills, own, m[1]))) fail(`${relative(root, f)}: broken link ${m[1]}`)
  }
  for (const m of read(f).matchAll(/`([a-z][\w-]*\.md)`/g)) {
    if (projectFiles.test(m[1])) continue
    const here = [join(dirname(f), m[1]), join(skills, own, 'references', m[1])]
    if (!here.some(existsSync)) fail(`${relative(root, f)}: broken link ${m[1]}`)
  }
}

// 6. Every SKILL.md version equals the top CHANGELOG release.
const release = (read(join(root, 'CHANGELOG.md')).match(/^## (\d+\.\d+\.\d+)/m) || [])[1]
for (const n of names) {
  const v = (read(join(skills, n, 'SKILL.md')).match(/version: "([^"]+)"/) || [])[1]
  if (v !== release) fail(`${n}/SKILL.md version ${v} != CHANGELOG ${release}`)
}

// 7. Starter and hook JS parses.
for (const f of files.filter((f) => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }) } catch (e) { fail(`${relative(root, f)}: ${String(e.stderr).split('\n')[0]}`) }
}

if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); process.exit(1) }
console.log(`✓ pack consistent (${files.length} files, release ${release})`)
