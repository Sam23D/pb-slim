# UX audit (product side)

Save as `specs/<slug>-ux-audit.md` next to the spec.

## Part 1 — stories

A table per role (Visitor / Member by job / Staff): `# | As a … I can … | Where | Status`.

- Status: **Works / Partly / Broken / Missing**, plus one clause of why when it is not Works. End with the counts.
- Check against **live data**, not only code. Copy the database and count derived rows per parent. A screen that shows a preview can still save nothing.
- Check the Install button, and that the installed app opens with the network off (the shell).
- Check offline **data** only if the spec says Offline: on: install the app, go offline, run each member story. Note which ones fail and whether that is acceptable.

## Part 2 — findings

F1…Fn ranked by harm to the core job. Each: what members see, why it matters, the fix in one line. Say when a fix will change real data; that needs the user's OK.

## Part 3 — recommended order

A table. As items ship, strike them and add a dated "built" note in place. Do not start a second audit file.

## Restyle audit

A restyle is a spec first (`pb-spec`): screen-by-screen Today → After, a "what does not change" list, pilot 3 screens. Regression check: demo script + story list + phone width + keyboard. Add the offline data check only if Offline: on.
