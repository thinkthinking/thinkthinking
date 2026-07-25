# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The source of [thinkthinking.ai](https://thinkthinking.ai) — a single-page bilingual personal site for **thinkthinking** (Ye Zhenjie): AI product builder, co-founder & product lead at [ZenMux.ai](https://zenmux.ai). Content is résumé-shaped: Research (ZenMux Arena studies), Writing (WeChat articles), Work (ZenMux, Ant Group Tbox, AgentOS, Baidu, CATL), Open Source.

Next.js 16 App Router + React 19 + Tailwind v4 + next-intl. Deployed on Vercel. pnpm is the package manager.

## Commands

```bash
pnpm dev      # next dev (Turbopack; root pinned in next.config.ts)
pnpm build    # next build
pnpm start    # serve the production build
pnpm lint     # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit   # typecheck; there is no package script for this
```

There is no test suite — no test runner, no test files. Verification is `pnpm lint` + `npx tsc --noEmit` + looking at the page.

## Architecture

**Everything renders from one route.** `src/app/[locale]/page.tsx` is the whole site. There are no other pages, no API routes, no data fetching. All content lives in two places:

- **Structure and links** — module-level `const` arrays in `page.tsx` (`RESEARCH`, `WORK`, `REPOS`, `ARTICLES`) plus `PERSON_LD` (schema.org JSON-LD). Each entry carries an `id`/`name`, a `tKey`, an external `href`, and a `color` referencing a `--rare-*` CSS variable.
- **Prose** — `messages/en.json` and `messages/zh.json`, keyed by namespace (`meta`, `header`, `hero`, `sections`, `work`, `research`, `repos`, `articles`, `footer`).

So adding a card means: append to the array in `page.tsx`, then add the matching `tKey` subtree to **both** message files. The two files must stay key-identical — a missing key throws at render, not at build. Quick check:

```bash
python3 -c "
import json
def keys(d,p=''):
    for k,v in d.items():
        yield from (keys(v,p+k+'.') if isinstance(v,dict) else [p+k])
a,b=(json.load(open(f'messages/{l}.json')) for l in ('en','zh'))
print(set(keys(a))^set(keys(b)) or 'ok')"
```

**Routing / i18n.** `src/i18n/routing.ts` is the single source of truth: locales `en` (default, served at `/`) and `zh` (at `/zh`), `localePrefix: "as-needed"`, `localeDetection: false` — English is deliberately the bare-domain default and there is no Accept-Language redirect. `src/proxy.ts` is the next-intl middleware (Next 16 names middleware `proxy.ts`); its matcher excludes anything with a file extension so `public/llm.txt` and `robots.txt` are served directly. Always import `Link`/`usePathname`/`redirect` from `@/i18n/navigation`, never from `next/link` — locale-aware navigation and the language switcher depend on it. Both locales are statically generated via `generateStaticParams` in `[locale]/layout.tsx`.

**Canonical URLs are hardcoded** in three places that must move together: `generateMetadata` in `[locale]/layout.tsx` (`alternates`, `openGraph.url`), `src/app/sitemap.ts`, and `PERSON_LD` in `page.tsx`.

**Server/client split.** `page.tsx` and `layout.tsx` are server components. Client components are exactly `site-header.tsx` (clipboard copy, QR popovers, language switch) and `color-wordmark.tsx` (rarity theme toggle, custom star cursor). The Xiaohongshu QR SVG is generated **at render time on the server** with `qrcode` in `page.tsx` and passed down to the client header as a string prop — that's why `SiteHeader`/`FooterSocialLinks` take a `qrSvg` param instead of generating it themselves.

## Styling

Tailwind v4 is imported in `src/app/globals.css`, but the site is **not** built out of utility classes. ~1200 lines of hand-written CSS define ~58 semantic `.rare-*` classes (`.rare-page`, `.rare-stack-card`, `.rare-work-card`, `.rare-section-heading`, …) driven by two per-element custom properties set inline from JSX: `--card-color` (from the entry's `color` field) and `--card-index` (for staggered `rare-arrive` animations and rotation). Tailwind's role is the `@theme inline` font mapping and the occasional utility inside client components.

The palette is `--rare-*` variables on `:root`. **Rarity themes**: `color-wordmark.tsx` writes `document.documentElement.dataset.rarity` (1–4) on click, and `html[data-rarity="N"]` blocks near the end of `globals.css` re-skin cards, wordmark color, page background and global saturation. Adding a card variant means handling it in those blocks too, or it silently opts out of the effect.

Fonts are `next/font/google` in `[locale]/layout.tsx`: Jost (sans), Oswald (display), Noto Sans SC (Chinese fallback — chained after Jost in the `body` font stack), Geist Mono (numbers, labels, kickers). There is a `@media (prefers-reduced-motion: reduce)` block at the end of `globals.css`; new animations belong there.

`src/app/[locale]/specimen-plate.tsx` is a large orphan: an elaborate hero "specimen plate" easter egg (logos fly into the masthead) that nothing imports, and whose `fg-*` classes no longer exist in `globals.css`. Treat it as reference material from an earlier design, not live code.

## Public assets

`public/` holds ~180 brand SVGs/PNGs across `model-logo/` (`<name>_color.svg` / `<name>_dark.svg`), `tech-logo/`, `maker-logo/`, `company-logo/`, `media-logo/`, and `thinkthinking/` (avatar). `public/llm.txt` is a hand-maintained structured-facts file for LLM agents, linked from the footer — when biography, roles, or research change on the page, update `llm.txt` and the README too; they duplicate the same facts by design.

## Agent skills and context tooling

- `.agents/skills/` is the **single source of truth** for project skills; `.claude/skills/` holds per-skill symlinks into it. Run `./scripts/sync-claude-skills-to-agents.sh` (`--dry-run` to preview) after adding or removing a skill — it creates missing links and prunes orphans. Never edit `.claude/skills/` directly.
- `skills-lock.json` pins externally-sourced skills (currently `opencli-*` from `jackwener/opencli`) by content hash.
- `./scripts/update-references.sh` clones/pulls the repos listed in `.context/references/references-list.txt` into `.context/references/` and auto-appends each to `.gitignore`. Reference checkouts are read-only context, not dependencies.
- `xiaohongshu-posts-2026.csv` is exported Xiaohongshu post analytics kept for content review; nothing in the app reads it.
