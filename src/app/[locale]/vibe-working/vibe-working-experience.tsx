"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

export interface Chapter {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  takeaway: string;
}

export interface ExperienceLabels {
  back: string;
  methodology: string;
  title: string;
  chapter: string;
  previous: string;
  next: string;
  finish: string;
  replay: string;
  keyboardHint: string;
  sourceNote: string;
}

export interface SceneLabels {
  origin: {
    kicker: string;
    headline: string;
    from: string;
    to: string;
    stages: string[];
  };
  bottleneck: {
    kicker: string;
    headline: string;
    stages: string[];
    multipliers: string[];
    bottleneck: string;
    note: string;
  };
  opc: {
    kicker: string;
    headline: string;
    owner: string;
    roles: string[];
    loop: string;
    note: string;
  };
  collaboration: {
    kicker: string;
    headline: string;
    context: string;
    people: string[];
    artifacts: string[];
    note: string;
  };
  artifacts: {
    kicker: string;
    headline: string;
    steps: string[];
    handoff: string;
    note: string;
  };
  organization: {
    kicker: string;
    headline: string;
    before: string;
    after: string;
    tree: string[];
    network: string[];
    note: string;
  };
  judgment: {
    kicker: string;
    headline: string;
    human: string;
    ai: string;
    humanItems: string[];
    aiItems: string[];
    formula: string;
    note: string;
  };
}

interface ExperienceProps {
  locale: string;
  chapters: Chapter[];
  labels: ExperienceLabels;
  scenes: SceneLabels;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function VibeWorkingExperience({
  locale,
  chapters,
  labels,
  scenes,
}: ExperienceProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [replay, setReplay] = useState(0);
  const reduceMotion = useReducedMotion();
  const isLast = active === chapters.length - 1;

  const goTo = useCallback(
    (next: number) => {
      const bounded = Math.min(Math.max(next, 0), chapters.length - 1);
      if (bounded === active) return;
      setDirection(bounded > active ? 1 : -1);
      setActive(bounded);
      setReplay((value) => value + 1);
      if (window.matchMedia("(max-width: 980px)").matches) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    },
    [active, chapters.length, reduceMotion],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("button, a, input, textarea, select")) return;

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goTo(active + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(active - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, goTo]);

  const chapter = chapters[active];

  return (
    <main className="vw-page">
      <div aria-hidden className="rare-grain" />

      <header className="vw-topbar">
        <Link className="vw-back" href="/">
          <ArrowLeft />
          <span>{labels.back}</span>
        </Link>
        <div className="vw-topbar-title">
          <span>{labels.methodology}</span>
          <strong>{labels.title}</strong>
        </div>
        <div className="vw-topbar-progress" aria-label={`${labels.chapter} ${active + 1}`}>
          <span>{String(active + 1).padStart(2, "0")}</span>
          <i aria-hidden />
          <span>{String(chapters.length).padStart(2, "0")}</span>
        </div>
      </header>

      <div className="vw-layout">
        <section className="vw-reader" aria-labelledby="vw-chapter-title">
          <nav className="vw-rail" aria-label={labels.chapter}>
            {chapters.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === active ? "is-active" : undefined}
                onClick={() => goTo(index)}
                aria-current={index === active ? "step" : undefined}
                aria-label={`${index + 1}. ${item.title}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </nav>

          <div className="vw-article-shell">
            <div className="vw-chapter-index">
              <span>{labels.chapter}</span>
              <strong>{String(active + 1).padStart(2, "0")}</strong>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={chapter.id}
                className="vw-article"
                custom={direction}
                initial={reduceMotion ? false : { opacity: 0, y: direction * 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: direction * -18 }}
                transition={{ duration: 0.42, ease: EASE }}
              >
                <p className="vw-eyebrow">{chapter.eyebrow}</p>
                <h1 id="vw-chapter-title">{chapter.title}</h1>
                <div className="vw-prose">
                  {chapter.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <blockquote>{chapter.takeaway}</blockquote>
              </motion.article>
            </AnimatePresence>

            <div className="vw-reader-footer">
              <p>{labels.sourceNote}</p>
              <div className="vw-reader-actions">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  disabled={active === 0}
                  aria-label={labels.previous}
                >
                  <ArrowLeft />
                </button>
                <button
                  type="button"
                  className="vw-next"
                  onClick={() => goTo(isLast ? 0 : active + 1)}
                >
                  <span>{isLast ? labels.finish : labels.next}</span>
                  <ArrowRight />
                </button>
              </div>
              <span className="vw-keyboard-hint">{labels.keyboardHint}</span>
            </div>
          </div>
        </section>

        <section className="vw-stage" aria-live="polite">
          <div className="vw-stage-grid" aria-hidden />
          <button
            className="vw-replay"
            type="button"
            onClick={() => setReplay((value) => value + 1)}
          >
            <ReplayIcon />
            <span>{labels.replay}</span>
          </button>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chapter.id}-${replay}`}
              className="vw-scene-wrap"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.975 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <Scene index={active} scenes={scenes} reducedMotion={Boolean(reduceMotion)} />
            </motion.div>
          </AnimatePresence>
          <div className="vw-stage-caption">
            <span>VIBE WORKING / {String(active + 1).padStart(2, "0")}</span>
            <span>{locale === "zh" ? "实践模型" : "PRACTICE MODEL"}</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function Scene({
  index,
  scenes,
  reducedMotion,
}: {
  index: number;
  scenes: SceneLabels;
  reducedMotion: boolean;
}) {
  const common = { reducedMotion };
  if (index === 0) return <OriginScene labels={scenes.origin} {...common} />;
  if (index === 1) return <BottleneckScene labels={scenes.bottleneck} {...common} />;
  if (index === 2) return <OpcScene labels={scenes.opc} {...common} />;
  if (index === 3)
    return <CollaborationScene labels={scenes.collaboration} {...common} />;
  if (index === 4) return <ArtifactsScene labels={scenes.artifacts} {...common} />;
  if (index === 5)
    return <OrganizationScene labels={scenes.organization} {...common} />;
  return <JudgmentScene labels={scenes.judgment} {...common} />;
}

function SceneTitle({ kicker, headline }: { kicker: string; headline: string }) {
  return (
    <div className="vw-scene-title">
      <span>{kicker}</span>
      <h2>{headline}</h2>
    </div>
  );
}

function OriginScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["origin"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-origin-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-origin-words">
        <motion.div
          initial={reducedMotion ? false : { x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.55, ease: EASE }}
        >
          <span>{labels.from}</span>
          <strong>VIBE<br />CODING</strong>
        </motion.div>
        <motion.span
          className="vw-origin-plus"
          initial={reducedMotion ? false : { rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.36, duration: 0.5, ease: EASE }}
        >
          +
        </motion.span>
        <motion.div
          initial={reducedMotion ? false : { x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.55, ease: EASE }}
        >
          <span>{labels.to}</span>
          <strong>VIBE<br />WORKING</strong>
        </motion.div>
      </div>
      <div className="vw-origin-track">
        {labels.stages.map((stage, index) => (
          <motion.span
            key={stage}
            initial={reducedMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 + index * 0.07, duration: 0.35 }}
          >
            {stage}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function BottleneckScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["bottleneck"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-bottleneck-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-pipeline-chart">
        {labels.stages.map((stage, index) => {
          const isFast = index === 2;
          const isBottleneck = index === 0;
          return (
            <motion.div
              key={stage}
              className={`vw-pipeline-column${isFast ? " is-fast" : ""}${isBottleneck ? " is-bottleneck" : ""}`}
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.42, ease: EASE }}
            >
              <span className="vw-pipeline-multiplier">{labels.multipliers[index]}</span>
              <div className="vw-pipeline-bar">
                {Array.from({ length: isFast ? 6 : isBottleneck ? 2 : 3 }).map((_, cell) => (
                  <motion.i
                    key={cell}
                    initial={reducedMotion ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.25 + cell * 0.05, duration: 0.32 }}
                  />
                ))}
              </div>
              <strong>{stage}</strong>
              {isBottleneck ? <em>{labels.bottleneck}</em> : null}
            </motion.div>
          );
        })}
      </div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function OpcScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["opc"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-opc-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-orbit">
        <motion.div
          className="vw-orbit-center"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span>OPC</span>
          <strong>{labels.owner}</strong>
        </motion.div>
        {labels.roles.map((role, index) => (
          <motion.div
            key={role}
            className="vw-orbit-role"
            style={{ "--orbit-index": index } as React.CSSProperties}
            initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18 + index * 0.08, duration: 0.38, ease: EASE }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{role}</strong>
          </motion.div>
        ))}
        <div className="vw-orbit-ring" aria-hidden />
      </div>
      <div className="vw-loop-label">
        <span>{labels.loop}</span>
        <ArrowRight />
      </div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function CollaborationScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["collaboration"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-collaboration-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-context-network">
        <motion.div
          className="vw-context-core"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span>CONTEXT</span>
          <strong>{labels.context}</strong>
          <div>
            {labels.artifacts.map((artifact) => (
              <i key={artifact}>{artifact}</i>
            ))}
          </div>
        </motion.div>
        {labels.people.map((person, index) => (
          <motion.div
            key={person}
            className="vw-network-person"
            style={{ "--person-index": index } as React.CSSProperties}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.35 }}
          >
            <span>{index + 1}</span>
            <strong>{person}</strong>
          </motion.div>
        ))}
        <div className="vw-network-lines" aria-hidden>
          {labels.people.map((person, index) => (
            <motion.i
              key={person}
              style={{ "--line-index": index } as React.CSSProperties}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 + index * 0.08, duration: 0.4 }}
            />
          ))}
        </div>
      </div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function ArtifactsScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["artifacts"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-artifacts-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-artifact-flow">
        {labels.steps.map((step, index) => (
          <motion.div
            key={step}
            className="vw-artifact-step"
            initial={reducedMotion ? false : { opacity: 0, x: -26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.11, duration: 0.4, ease: EASE }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < labels.steps.length - 1 ? (
              <motion.i
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.18 + index * 0.11, duration: 0.35 }}
              />
            ) : null}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="vw-handoff-stamp"
        initial={reducedMotion ? false : { rotate: -8, scale: 1.25, opacity: 0 }}
        animate={{ rotate: -3, scale: 1, opacity: 1 }}
        transition={{ delay: 0.62, duration: 0.5, ease: EASE }}
      >
        {labels.handoff}
      </motion.div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function OrganizationScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["organization"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-organization-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-org-compare">
        <div className="vw-org-panel vw-org-before">
          <span>{labels.before}</span>
          <div className="vw-org-tree">
            {labels.tree.map((item, index) => (
              <motion.i
                key={item}
                className={`level-${index}`}
                initial={reducedMotion ? false : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.35 }}
              >
                {item}
              </motion.i>
            ))}
          </div>
        </div>
        <div className="vw-org-arrow"><ArrowRight /></div>
        <div className="vw-org-panel vw-org-after">
          <span>{labels.after}</span>
          <div className="vw-org-network">
            {labels.network.map((item, index) => (
              <motion.i
                key={item}
                style={{ "--network-index": index } as React.CSSProperties}
                initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.24 + index * 0.08, duration: 0.36, ease: EASE }}
              >
                {item}
              </motion.i>
            ))}
            <div className="vw-org-links" aria-hidden />
          </div>
        </div>
      </div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function JudgmentScene({
  labels,
  reducedMotion,
}: {
  labels: SceneLabels["judgment"];
  reducedMotion: boolean;
}) {
  return (
    <div className="vw-scene vw-judgment-scene">
      <SceneTitle kicker={labels.kicker} headline={labels.headline} />
      <div className="vw-judgment-columns">
        <motion.div
          className="vw-judgment-human"
          initial={reducedMotion ? false : { opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: EASE }}
        >
          <span>HUMAN</span>
          <strong>{labels.human}</strong>
          <ul>
            {labels.humanItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </motion.div>
        <motion.div
          className="vw-judgment-ai"
          initial={reducedMotion ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.48, ease: EASE }}
        >
          <span>AI</span>
          <strong>{labels.ai}</strong>
          <ul>
            {labels.aiItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </motion.div>
      </div>
      <motion.div
        className="vw-formula"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48, duration: 0.4 }}
      >
        {labels.formula}
      </motion.div>
      <p className="vw-scene-note">{labels.note}</p>
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
      <path d="M4 4v4.6h4.6" />
    </svg>
  );
}
