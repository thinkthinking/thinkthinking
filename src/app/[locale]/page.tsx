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
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <SpecimenPlate />
      </section>

      {/* ── I. Research ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-6 w-full max-w-6xl px-6 sm:px-10 md:mt-0">
        <IndexHeading no="I" title={tSections("research.title")} note={tSections("research.note")} />
        <ol>
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
        <ol>
          {ARTICLES.map((a) => (
            <li key={a.tKey} className="border-b border-[var(--fg-ink)]/15">
              <a
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fg-paper)] sm:gap-8"
              >
                <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] tracking-tight text-[var(--fg-ink-soft)]">
                  {a.date}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-snug text-[var(--fg-ink)]">
                    {tArticles(`${a.tKey}.title`)}
                  </span>
                  <span className="fg-note mt-0.5 block text-[12px] text-[var(--fg-ink-soft)]">
                    {tArticles(`${a.tKey}.venue`)}
                  </span>
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 self-center text-[var(--fg-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-ink)]" />
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
        <ol>
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
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {REPOS.map((repo) => (
            <li key={repo.name} className="border-b border-[var(--fg-ink)]/15">
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fg-paper)]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[13px] tracking-tight text-[var(--fg-ink)] underline-offset-4 group-hover:underline">
                    {repo.name}
                  </span>
                  <span className="fg-note mt-1 block text-[13px] text-[var(--fg-ink-soft)]">
                    {tRepos(repo.tKey)}
                  </span>
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-[var(--fg-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-ink)]" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Colophon — one quiet line. ───────────────────────────────────── */}
      <footer className="relative z-10 mx-auto mt-24 w-full max-w-6xl px-6 pb-14 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--fg-ink)]/20 pt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--fg-ink-soft)]">
            © {new Date().getFullYear()} thinkthinking
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--fg-ink-soft)]">
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
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-[var(--fg-ink)]/25 pb-3 ${className ?? ""}`}
    >
      <div className="flex items-baseline gap-3">
        <span className="fg-note text-sm text-[var(--fg-ink-soft)]">{no}.</span>
        <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--fg-ink)]">
          {title}
        </h2>
      </div>
      <p className="fg-note hidden text-sm text-[var(--fg-ink-soft)] sm:block">{note}</p>
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
    <div className="flex flex-col py-7 sm:py-9">
      <div className="flex flex-col gap-x-8 gap-y-2 md:flex-row md:items-baseline md:justify-between">
        <span className="fg-outline font-(family-name:--font-archivo-black) text-[clamp(2.1rem,6.8vw,5rem)] uppercase leading-[0.95] tracking-tight">
          {row.display}
        </span>
        <span className="flex shrink-0 flex-col gap-1 md:items-end md:text-right">
          {row.logo &&
            (row.logo.href ? (
              <a
                href={row.logo.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={row.logo.alt}
                className="relative z-30 mb-1 inline-block self-start rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fg-paper)] md:self-end"
              >
                {logoImg}
              </a>
            ) : (
              <span className="mb-1 block self-start md:self-end">{logoImg}</span>
            ))}
          <span className="fg-note text-[15px] leading-snug text-[var(--fg-ink-soft)]">
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
      {body && (
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-[var(--fg-ink-soft)]">
          {body}
        </p>
      )}
    </div>
  );

  return (
    <li
      className="fg-index-row group relative border-b border-[var(--fg-ink)]/15"
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
      <div className="flex items-baseline gap-4 sm:gap-8">
        <RowNumber n={index} />
        <div className="min-w-0 flex-1">{inner}</div>
      </div>
    </li>
  );
}

function RowNumber({ n }: { n: number }) {
  return (
    <span className="hidden w-10 shrink-0 pt-2 font-mono text-xs tracking-widest text-[var(--fg-ink-soft)] sm:block">
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
