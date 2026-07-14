import Image from "next/image";
import QRCode from "qrcode";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "./site-header";

interface EntryDef {
  id: string;
  display: string;
  tKey: string;
  href: string | null;
  color: string;
  ink?: "light" | "dark";
  logo?: { src: string; alt: string; href?: string };
}

const RESEARCH: EntryDef[] = [
  {
    id: "who-are-you",
    display: "WHO ARE YOU?",
    tKey: "whoAreYou",
    href: "https://arena.zenmux.ai/who-are-you",
    color: "var(--rare-white)",
  },
  {
    id: "token-economics",
    display: "TOKEN ECONOMICS",
    tKey: "tokenEconomics",
    href: "https://arena.zenmux.ai/token-economics",
    color: "var(--rare-lilac)",
  },
  {
    id: "agent-harness",
    display: "AGENT HARNESS",
    tKey: "agentHarness",
    href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw",
    color: "var(--rare-cream)",
  },
  {
    id: "token-deals",
    display: "TOKEN DEALS",
    tKey: "tokenDeals",
    href: "https://arena.zenmux.ai/token-deals",
    color: "var(--rare-acid)",
  },
];

const WORK: EntryDef[] = [
  {
    id: "zenmux",
    display: "ZENMUX",
    tKey: "zenmux",
    href: "https://zenmux.ai",
    color: "var(--rare-mint)",
    logo: { src: "/company-logo/zenmux.png", alt: "ZenMux", href: "https://zenmux.ai" },
  },
  {
    id: "tbox",
    display: "TBOX",
    tKey: "tbox",
    href: "https://b.tbox.cn/inc-about",
    color: "var(--rare-sky)",
    logo: {
      src: "/company-logo/antgroup.png",
      alt: "Ant Group",
      href: "https://www.antgroup.com",
    },
  },
  {
    id: "agentos",
    display: "AGENTOS",
    tKey: "agentos",
    href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw",
    color: "var(--rare-lilac)",
    logo: { src: "/company-logo/agentos.png", alt: "AgentOS" },
  },
  {
    id: "baidu",
    display: "PADDLEPADDLE",
    tKey: "baidu",
    href: "https://www.paddlepaddle.org.cn",
    color: "var(--rare-cream)",
    logo: {
      src: "/company-logo/baidu.png",
      alt: "Baidu",
      href: "https://www.baidu.com",
    },
  },
  {
    id: "catl",
    display: "CATL",
    tKey: "catl",
    href: null,
    color: "var(--rare-coral)",
    logo: { src: "/company-logo/catl.svg", alt: "CATL", href: "https://www.catl.com" },
  },
];

const REPOS = [
  {
    name: "thinkthinking / thinkthinking",
    tKey: "website",
    href: "https://github.com/thinkthinking",
    color: "var(--rare-coral)",
  },
  {
    name: "ZenMux / zenmux-arena",
    tKey: "zenmuxArena",
    href: "https://github.com/ZenMux/zenmux-arena",
    color: "var(--rare-mint)",
  },
  {
    name: "thinkthinking / skills",
    tKey: "skills",
    href: "https://github.com/thinkthinking/skills",
    color: "var(--rare-lilac)",
  },
  {
    name: "thinkthinking / cli",
    tKey: "cli",
    href: "https://github.com/thinkthinking/cli",
    color: "var(--rare-acid)",
  },
  {
    name: "vibe-working-templates",
    tKey: "vibeTemplates",
    href: "https://github.com/thinkthinking",
    color: "var(--rare-white)",
  },
  {
    name: "PaddlePaddle / PaddleDetection",
    tKey: "paddleDetection",
    href: "https://github.com/PaddlePaddle/PaddleDetection",
    color: "var(--rare-sky)",
  },
  {
    name: "PaddlePaddle / Paddle3D",
    tKey: "paddle3d",
    href: "https://github.com/PaddlePaddle/Paddle3D",
    color: "var(--rare-cream)",
  },
];

const ARTICLES = [
  {
    date: "2026.06",
    tKey: "deepseek",
    href: "https://mp.weixin.qq.com/s/0DpC-Q2S6KNs4hVOY9HtXQ",
    color: "var(--rare-lilac)",
  },
  {
    date: "2026.06",
    tKey: "whoAreYou",
    href: "https://mp.weixin.qq.com/s/sIB3f3_OeeUgMPlQ55-99Q",
    color: "var(--rare-white)",
  },
  {
    date: "2023.12",
    tKey: "agentos",
    href: "https://mp.weixin.qq.com/s/pbCg1KOXK63U9QY28yXpsw",
    color: "var(--rare-acid)",
  },
];

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

const XIAOHONGSHU_URL =
  "https://www.xiaohongshu.com/user/profile/6401506e0000000029017abc";

function xiaohongshuQrSvg(): Promise<string> {
  return QRCode.toString(XIAOHONGSHU_URL, {
    type: "svg",
    margin: 0,
    color: { dark: "#090909", light: "#ffffff00" },
  });
}

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
    <main className="rare-page">
      <div aria-hidden className="rare-grain" />
      <a className="rare-skip-link" href="#hero-title">
        {locale === "zh" ? "跳到主要内容" : "Skip to content"}
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }}
      />

      <div className="rare-shell">
        <SiteHeader qrSvg={qrSvg} />

        <section className="rare-hero" aria-labelledby="hero-title">
          <div className="rare-hero-wordmark">
            <h1 id="hero-title">THINKTHINKING</h1>
          </div>

          <div className="rare-research-heading">
            <SectionHeading
              index="00"
              id="research-title"
              title={tSections("research.title")}
              note={tSections("research.note")}
            />
          </div>

          <ol className="rare-stack" aria-label={tSections("research.title")}>
            {RESEARCH.map((item, index) => (
              <li
                key={item.id}
                className="rare-stack-card"
                style={
                  {
                    "--card-color": item.color,
                    "--card-index": index,
                  } as React.CSSProperties
                }
              >
                <a href={item.href ?? undefined} target="_blank" rel="noopener noreferrer">
                  <span className="rare-card-title">{item.display}</span>
                  <span className="rare-card-copy">
                    <span>{tResearch(`${item.tKey}.note`)}</span>
                    <span className="rare-card-fact">{tResearch(`${item.tKey}.fact`)}</span>
                  </span>
                  <span className="rare-card-number">{String(index + 1).padStart(3, "0")}</span>
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="rare-section rare-writing" aria-labelledby="writing-title">
          <SectionHeading
            index="01"
            id="writing-title"
            title={tSections("writing.title")}
            note={tSections("writing.note")}
          />
          <ol className="rare-writing-list">
            {ARTICLES.map((article, index) => (
              <li
                key={article.tKey}
                className="rare-writing-card"
                style={
                  {
                    "--card-color": article.color,
                    "--card-index": index,
                  } as React.CSSProperties
                }
              >
                <a href={article.href} target="_blank" rel="noopener noreferrer">
                  <span className="rare-writing-visual" aria-hidden>
                    <span className="rare-writing-visual-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rare-writing-visual-signal" />
                  </span>
                  <span className="rare-writing-content">
                    <h3>{tArticles(`${article.tKey}.title`)}</h3>
                    <span className="rare-writing-meta">
                      <span>{tArticles(`${article.tKey}.venue`)}</span>
                      <time dateTime={article.date.replace(".", "-")}>{article.date}</time>
                      <ArrowUpRight />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="rare-section rare-work" aria-labelledby="work-title">
          <SectionHeading
            index="02"
            id="work-title"
            title={tSections("work.title")}
            note={tSections("work.note")}
          />
          <ol className="rare-work-list">
            {WORK.map((item, index) => (
              <li
                key={item.id}
                className="rare-work-card"
                style={
                  {
                    "--card-color": item.color,
                    "--card-index": index,
                  } as React.CSSProperties
                }
              >
                {item.href ? (
                  <a
                    className="rare-work-link"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.display}
                  />
                ) : null}
                <span className="rare-work-number">{String(index + 5).padStart(3, "0")}</span>
                <div className="rare-work-heading">
                  <h3>{item.display}</h3>
                  <p>{tWork(`${item.tKey}.note`)}</p>
                </div>
                <div className="rare-work-story">
                  <p className="rare-work-meta">{tWork(`${item.tKey}.meta`)}</p>
                  <p>{tWork(`${item.tKey}.body`)}</p>
                  <p className="rare-work-fact">{tWork(`${item.tKey}.fact`)}</p>
                </div>
                {item.logo ? (
                  <Image
                    src={item.logo.src}
                    alt={item.logo.alt}
                    width={220}
                    height={52}
                    className="rare-work-logo"
                  />
                ) : null}
                {item.href ? <ArrowUpRight /> : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="rare-section rare-source" aria-labelledby="source-title">
          <SectionHeading
            index="03"
            id="source-title"
            title={tSections("openSource.title")}
            note={tSections("openSource.note")}
          />
          <ul className="rare-source-list">
            {REPOS.map((repo, index) => (
              <li
                key={repo.name}
                className="rare-source-card"
                style={
                  {
                    "--card-color": repo.color,
                    "--card-index": index,
                  } as React.CSSProperties
                }
              >
                <a href={repo.href} target="_blank" rel="noopener noreferrer">
                  <span className="rare-source-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="rare-source-copy">
                    <h3>{repo.name}</h3>
                    <p>{tRepos(repo.tKey)}</p>
                  </span>
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="rare-footer">
          <div className="rare-footer-wordmark">THINKTHINKING</div>
          <div className="rare-footer-meta">
            <span>© {new Date().getFullYear()} · SINGAPORE</span>
            <a href="mailto:yezhenjie@zenmux.ai">KNOCK@THINKTHINKING.AI</a>
            <span>
              {tFooter("forAgents")} <a href="/llm.txt">thinkthinking.ai/llm.txt</a>
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({
  index,
  id,
  title,
  note,
}: {
  index: string;
  id: string;
  title: string;
  note: string;
}) {
  return (
    <div className="rare-section-heading">
      <span>{index}</span>
      <h2 id={id}>{title}</h2>
      <p>{note}</p>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg
      className="rare-arrow"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
