# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture & scaffolding | Data | Astro/Tailwind setup, i18n routing, project structure, deployment config |
| Frontend & UI | Mouth | Sections, hero, gallery, CTAs, responsive layout, components |
| Multilingual / i18n | Mouth | ES/EN/FR content, language selector, hreflang, SEO copy |
| Image optimization | Mouth | WebP/AVIF, lazy loading, srcset, gallery thumbnails |
| Security review | Sloth | CSP/headers, OWASP/NIST checks, content protection (PI), dependencies, privacy |
| Functional QA & acceptance | Chunk | Requirements traceability, accessibility, Lighthouse, cross-browser |
| Code review | Data | Review PRs, check quality, architecture coherence |
| Scope & priorities | Data | What to build next, trade-offs, decisions |
| Session logging | Scribe | Automatic — never needs routing |
| RAI review | Rai | Content safety, bias checks, credential detection, ethical review |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Data |
| `squad:{name}` | Pick up issue and complete the work | Named member |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, **Data** (Lead) triages it.
2. When a `squad:{member}` label is applied, that member picks up the issue.
3. Members can reassign by swapping labels.
4. The `squad` label is the untriaged inbox.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.**
4. **Reviewers gate:** Sloth (security) and Chunk (functionality) must approve before work is considered done. On rejection, a different agent revises (lockout enforced).
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work** — spawn reviewers to draft checklists from requirements while build is in progress.
