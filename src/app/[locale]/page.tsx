// thinkthinking.ai — the personal homepage of thinkthinking, spoken in the
// same editorial "field guide" voice as ZenMux Arena: warm cream paper, a
// specimen ring around a giant outlined masthead (with the plumage easter
// egg — click a mark and it flies into the title), index sections in huge
// stroked display type that fill with their accent ink on hover, serif-italic
// margin notes and small mono fact lines.
//
// Structure: masthead (avatar + contact popovers + language switch) →
// specimen-plate hero (client; easter egg + toolbox strip) → the index
// (Research / Writing / Work) in giant rows → Open Source grid →
// minimal colophon. Fully static per locale.

import Image from "next/image";
import QRCode from "qrcode";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "./site-header";
import { SpecimenPlate } from "./specimen-plate";

/* ── The index data (structure here, copy in messages/<locale>.json) ─────── */

interface RowDef {
  id: string;
  /** Giant outlined display name (not translated — proper nouns). */
  display: string;
  /** Translation key under work/research/products. */
  tKey: string;
  hasBody?: boolean;
  hasMeta?: boolean;
  /** Company wordmark under public/company-logo (Work rows). */
  logo?: { src: string; alt: string; href?: string };
  href: string | null;
  accent: string;
}

const RESEARCH: RowDef[] = [
  {
    id: "who-are-you",
    display: "Who Are You?",
    tKey: "whoAreYou",
    href: "https://arena.zenmux.ai/who-are-you",
    accent: "var(--fg-green)",
  },
  {
    id: "token-economics",
    display: "Token Economics",
    tKey: "tokenEconomics",
    href: "https://arena.zenmux.ai/token-economics",
    accent: "var(--fg-ochre)",
  },
  {
    id: "agent-harness",
    display: "Agent Harness",
    tKey: "agentHarness",
    href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw",
    accent: "var(--fg-red)",
  },
  {
    id: "token-deals",
    display: "Token Deals",
    tKey: "tokenDeals",
    href: "https://arena.zenmux.ai/token-deals",
    accent: "var(--fg-blue)",
  },
];

const WORK: RowDef[] = [
  {
    id: "zenmux",
    display: "ZenMux",
    tKey: "zenmux",
    hasBody: true,
    hasMeta: true,
    logo: { src: "/company-logo/zenmux.png", alt: "ZenMux", href: "https://zenmux.ai" },
    href: "https://zenmux.ai",
    accent: "var(--fg-green)",
  },
  {
    id: "tbox",
    display: "Tbox",
    tKey: "tbox",
    hasBody: true,
    hasMeta: true,
    logo: { src: "/company-logo/antgroup.png", alt: "Ant Group", href: "https://www.antgroup.com" },
    href: "https://b.tbox.cn/inc-about",
    accent: "var(--fg-blue)",
  },
  {
    id: "agentos",
    display: "AgentOS",
    tKey: "agentos",
    hasBody: true,
    hasMeta: true,
    logo: { src: "/company-logo/agentos.png", alt: "AgentOS" },
    href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw",
    accent: "var(--fg-ochre)",
  },
  {
    id: "baidu",
    display: "PaddlePaddle",
    tKey: "baidu",
    hasBody: true,
    hasMeta: true,
    logo: { src: "/company-logo/baidu.png", alt: "Baidu", href: "https://www.baidu.com" },
    href: "https://www.paddlepaddle.org.cn",
    accent: "var(--fg-blue)",
  },
  {
    id: "catl",
    display: "CATL",
    tKey: "catl",
    hasBody: true,
    hasMeta: true,
    logo: { src: "/company-logo/catl.svg", alt: "CATL", href: "https://www.catl.com" },
    href: null,
    accent: "var(--fg-red)",
  },
];

const REPOS = [
  { name: "ZenMux / zenmux-arena", tKey: "zenmuxArena", href: "https://github.com/ZenMux/zenmux-arena" },
  { name: "thinkthinking / skills", tKey: "skills", href: "https://github.com/thinkthinking/skills" },
  { name: "thinkthinking / cli", tKey: "cli", href: "https://github.com/thinkthinking/cli" },
  { name: "vibe-working-templates", tKey: "vibeTemplates", href: "https://github.com/thinkthinking" },
  { name: "PaddlePaddle / PaddleDetection", tKey: "paddleDetection", href: "https://github.com/PaddlePaddle/PaddleDetection" },
  { name: "PaddlePaddle / Paddle3D", tKey: "paddle3d", href: "https://github.com/PaddlePaddle/Paddle3D" },
];

const ARTICLES = [
  { date: "2026.06", tKey: "deepseek", href: "https://mp.weixin.qq.com/s/0DpC-Q2S6KNs4hVOY9HtXQ" },
  { date: "2026.06", tKey: "whoAreYou", href: "https://mp.weixin.qq.com/s/sIB3f3_OeeUgMPlQ55-99Q" },
  { date: "2023.12", tKey: "agentos", href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw" },
];

/* ── JSON-LD (Person) ──────────────────────────────────────────────────── */

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "thinkthinking",
  url: "https://thinkthinking.ai",
  image: "https://thinkthinking.ai/thinkthinking/selfie.jpg",
  email: "mailto:yezhenjie@zenmux.ai",
  jobTitle: "AI Technical Product Manager · Co-Founder",
  worksFor: { "@type": "Organization", name: "ZenMux.ai", url: "https://zenmux.ai" },
  sameAs: [
    "https://github.com/thinkthinking",
    "https://x.com/thinkthinking_",
    "https://www.xiaohongshu.com/user/profile/6401506e0000000029017abc",
    "https://zenmux.ai",
    "https://arena.zenmux.ai",
  ],
};

/* 小红书 profile — rendered to a QR so it scans straight from the page. */
const XIAOHONGSHU_URL = "https://www.xiaohongshu.com/user/profile/6401506e0000000029017abc";

function xiaohongshuQrSvg(): Promise<string> {
  return QRCode.toString(XIAOHONGSHU_URL, {
    type: "svg",
    margin: 0,
    color: { dark: "#211d16", light: "#ffffff00" },
  });
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [qrSvg, tSections, tWork, tResearch, tRepos, tArticles, tFooter] =
    await Promise.all([
      xiaohongshuQrSvg(),
      getTranslations("sections"),
      getTranslations("work"),
      getTranslations("research"),
      getTranslations("repos"),
      getTranslations("articles"),
      getTranslations("footer"),
    ]);

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Paper grain + a faint warm vignette from the top. */}
      <div aria-hidden className="fg-grain pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_60%_at_50%_0%,rgba(176,125,43,0.07),transparent_70%)]"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }}
      />

      {/* ── Masthead: avatar + contacts + language switch ────────────────── */}
      <SiteHeader qrSvg={qrSvg} />

      {/* ── Hero: the specimen plate (client — the masthead is the egg) ──── */}
      <section className="relative z-10 w-full">
        <div className="fg-editorial-frame">
          <SpecimenPlate />
        </div>
      </section>

      {/* ── I. Research ──────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full">
        <IndexHeading no="I" title={tSections("research.title")} note={tSections("research.note")} />
        <ol className="fg-editorial-frame border-b-0">
          {RESEARCH.map((row, i) => (
            <GiantRow
              key={row.id}
              row={row}
              index={i + 1}
              note={tResearch(`${row.tKey}.note`)}
              fact={tResearch(`${row.tKey}.fact`)}
              status={row.href ? undefined : tResearch(`${row.tKey}.status`)}
            />
          ))}
        </ol>

        {/* ── II. Writing ──────────────────────────────────────────────── */}
        <IndexHeading
          no="II"
          title={tSections("writing.title")}
          note={tSections("writing.note")}
          className="mt-24"
        />
        <ol className="fg-editorial-frame border-b-0">
          {ARTICLES.map((a) => (
            <li key={a.tKey} className="fg-compact-row group">
              <a
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="fg-compact-row-link outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fg-ink)]"
              >
                <span className="fg-compact-index font-mono text-[10px] tracking-[0.08em] text-[var(--fg-ink-soft)]">
                  {a.date}
                </span>
                <span className="fg-compact-main min-w-0">
                  <span className="block text-[clamp(1rem,1.8vw,1.25rem)] font-medium leading-snug text-[var(--fg-ink)] transition-transform duration-300 group-hover:translate-x-1">
                    {tArticles(`${a.tKey}.title`)}
                  </span>
                </span>
                <span className="fg-compact-aside">
                  <span className="fg-note block text-[13px] leading-snug text-[var(--fg-ink-soft)]">
                    {tArticles(`${a.tKey}.venue`)}
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-[var(--fg-ink-soft)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-ink)]" />
                </span>
              </a>
            </li>
          ))}
        </ol>

        {/* ── III. Work ────────────────────────────────────────────────── */}
        <IndexHeading
          no="III"
          title={tSections("work.title")}
          note={tSections("work.note")}
          className="mt-24"
        />
        <ol className="fg-editorial-frame border-b-0">
          {WORK.map((row, i) => (
            <GiantRow
              key={row.id}
              row={row}
              index={RESEARCH.length + i + 1}
              note={tWork(`${row.tKey}.note`)}
              meta={row.hasMeta ? tWork(`${row.tKey}.meta`) : undefined}
              body={row.hasBody ? tWork(`${row.tKey}.body`) : undefined}
              fact={tWork(`${row.tKey}.fact`)}
            />
          ))}
        </ol>

        {/* ── IV. Open Source ──────────────────────────────────────────── */}
        <IndexHeading
          no="IV"
          title={tSections("openSource.title")}
          note={tSections("openSource.note")}
          className="mt-24"
        />
        <ul className="fg-editorial-frame border-b-0">
          {REPOS.map((repo, i) => (
            <li key={repo.name} className="fg-compact-row group">
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="fg-compact-row-link outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fg-ink)]"
              >
                <span className="fg-compact-index font-mono text-[10px] tracking-[0.08em] text-[var(--fg-ink-soft)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="fg-compact-main min-w-0">
                  <span className="block font-mono text-[13px] tracking-tight text-[var(--fg-ink)] underline-offset-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:underline">
                    {repo.name}
                  </span>
                </span>
                <span className="fg-compact-aside">
                  <span className="fg-note min-w-0 text-[13px] leading-snug text-[var(--fg-ink-soft)]">
                    {tRepos(repo.tKey)}
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-[var(--fg-ink-soft)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-ink)]" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Colophon — one quiet line. ───────────────────────────────────── */}
      <footer className="relative z-10 mt-24 w-full pb-10">
        <div className="fg-editorial-frame fg-footer-grid grid gap-4 border-t px-4 py-6 sm:gap-0 sm:px-0 sm:py-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-ink-soft)] sm:flex sm:items-center sm:justify-center">
            © {new Date().getFullYear()}
          </p>
          <p className="hidden border-l border-[var(--fg-line-strong)] text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--fg-ink-soft)] sm:flex sm:items-center sm:px-5">
            thinkthinking
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--fg-ink-soft)] sm:py-6 sm:pr-5">
            {tFooter("forAgents")}{" "}
            <a
              href="/llm.txt"
              className="underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--fg-ink)]"
            >
              thinkthinking.ai/llm.txt
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ── Index heading — small roman numeral + rule ───────────────────────────── */

function IndexHeading({
  no,
  title,
  note,
  className,
}: {
  no: string;
  title: string;
  note: string;
  className?: string;
}) {
  return (
    <div className={`fg-section-heading ${className ?? ""}`}>
      <span className="fg-section-no fg-note text-sm text-[var(--fg-ink-soft)]">{no}.</span>
      <h2 className="fg-section-title text-sm font-medium uppercase tracking-[0.3em] text-[var(--fg-ink)]">
        {title}
      </h2>
      <p className="fg-section-note fg-note text-sm text-[var(--fg-ink-soft)]">{note}</p>
    </div>
  );
}

/* ── Giant outlined row ───────────────────────────────────────────────────── */

function GiantRow({
  row,
  index,
  note,
  meta,
  body,
  fact,
  status,
}: {
  row: RowDef;
  index: number;
  note: string;
  meta?: string;
  body?: string;
  fact: string | null;
  status?: string;
}) {
  const logoImg = row.logo && (
    <Image
      src={row.logo.src}
      alt={row.logo.alt}
      width={200}
      height={48}
      className="h-5 w-auto opacity-80 transition-opacity group-hover:opacity-100"
    />
  );

  const inner = (
    <div className="contents">
      <div className="fg-row-main">
        <span className="fg-outline block font-(family-name:--font-archivo-black) text-[clamp(1.65rem,8vw,2.1rem)] uppercase leading-[0.92] tracking-[-0.045em] sm:text-[clamp(2.1rem,6vw,4.75rem)]">
          {row.display}
        </span>
        {body && (
          <p className="mt-6 max-w-[44rem] text-[14px] leading-[1.75] text-[var(--fg-ink-soft)]">
            {body}
          </p>
        )}
      </div>
      <div className="fg-row-aside">
        <span className="flex flex-col gap-2">
          {row.logo &&
            (row.logo.href ? (
              <a
                href={row.logo.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={row.logo.alt}
                className="relative z-30 mb-2 inline-block self-start rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fg-paper)]"
              >
                {logoImg}
              </a>
            ) : (
              <span className="mb-2 block self-start">{logoImg}</span>
            ))}
          <span className="fg-note text-[15px] leading-[1.4] text-[var(--fg-ink)]">
            {note}
          </span>
          {meta && (
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-ink-soft)]">
              {meta}
            </span>
          )}
          {fact && (
            <span className="font-mono text-[11px] tracking-tight text-[var(--fg-ink)]/70">
              {fact}
            </span>
          )}
          {status && (
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--fg-ink-soft)]">
              {status}
            </span>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <li
      className="fg-index-row group relative grid"
      style={{ "--fg-row-accent": row.accent } as React.CSSProperties}
    >
      {row.href && (
        <a
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={row.display}
          className="absolute inset-0 z-20 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fg-paper)]"
        />
      )}
      <RowNumber n={index} />
      {inner}
    </li>
  );
}

function RowNumber({ n }: { n: number }) {
  return (
    <span className="fg-row-number font-mono text-[10px] tracking-[0.14em] text-[var(--fg-ink-soft)]">
      {String(n).padStart(2, "0")}
    </span>
  );
}

/* ── Marks ────────────────────────────────────────────────────────────────── */

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
