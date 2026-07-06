"use client";

// The hero "specimen plate": TWO concentric rings of marks around the giant
// outlined masthead — the outer ring is the frontier models & agent tools,
// the inner ring is the languages & lab tooling from eight years of shipping.
// Every mark is a live specimen with the plumage easter egg ported from
// ZenMux Arena: click one (or the title, which picks at random) and it FLIES
// off its perch, arcs across the hero, and crashes into a random letter of
// THINK THINKING — feathers burst, the letter is replaced by the mark, and
// the brand's colours ripple outward through the neighbouring letters.
//
// Client component; ring geometry stays deterministic module-level data so
// SSR and hydration agree. Math.random() only runs inside click handlers.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/* ── Specimens ─────────────────────────────────────────────────────────────
   dir "model-logo" files are <file>_color.svg; "tech-logo" files are
   <file>.svg. `ink` + `stops` are the colours extracted from each SVG —
   they drive the letter dye, shockwave and feather burst. */

interface Specimen {
  file: string;
  name: string;
  dir: "model-logo" | "tech-logo";
  ink: string;
  stops: string[];
}

const MODELS: Specimen[] = [
  { file: "zenmux", name: "ZenMux", dir: "model-logo", ink: "#141414", stops: ["#141414"] },
  { file: "claude", name: "Anthropic Claude", dir: "model-logo", ink: "#D97757", stops: ["#D97757"] },
  { file: "chatgpt", name: "OpenAI GPT", dir: "model-logo", ink: "#191919", stops: ["#191919"] },
  { file: "gemini", name: "Google Gemini", dir: "model-logo", ink: "#3186FF", stops: ["#3186FF", "#08B962", "#FABC12", "#F94543"] },
  { file: "claude-code", name: "Claude Code", dir: "model-logo", ink: "#D97757", stops: ["#D97757"] },
  { file: "codex", name: "OpenAI Codex", dir: "model-logo", ink: "#3941FF", stops: ["#3941FF", "#7A9DFF", "#B1A7FF"] },
  { file: "cursor", name: "Cursor", dir: "model-logo", ink: "#131313", stops: ["#131313"] },
  { file: "cline", name: "Cline", dir: "model-logo", ink: "#141414", stops: ["#141414"] },
  { file: "copilot", name: "GitHub Copilot", dir: "model-logo", ink: "#191919", stops: ["#191919"] },
  { file: "grok", name: "xAI Grok", dir: "model-logo", ink: "#131418", stops: ["#131418"] },
  { file: "qwen", name: "Alibaba Qwen", dir: "model-logo", ink: "#6336E7", stops: ["#6336E7", "#6F69F7"] },
  { file: "kimi", name: "Kimi", dir: "model-logo", ink: "#027AFF", stops: ["#027AFF"] },
  { file: "deepeek", name: "DeepSeek", dir: "model-logo", ink: "#4D6BFE", stops: ["#4D6BFE"] },
  { file: "doubao", name: "ByteDance Doubao", dir: "model-logo", ink: "#1E37FC", stops: ["#1E37FC", "#A569FF", "#37E1BE"] },
  { file: "moonshot", name: "Moonshot AI", dir: "model-logo", ink: "#101010", stops: ["#101010"] },
  { file: "mistral", name: "Mistral", dir: "model-logo", ink: "#FA500F", stops: ["#E10500", "#FA500F", "#FF8205", "#FFAF00", "#FFD700"] },
  { file: "baidu", name: "Baidu ERNIE", dir: "model-logo", ink: "#2932E1", stops: ["#2932E1"] },
  { file: "bytedance", name: "ByteDance", dir: "model-logo", ink: "#325AB4", stops: ["#325AB4", "#3C8CFF", "#00C8D2", "#78E6DC"] },
];

const TOOLS: Specimen[] = [
  { file: "python", name: "Python", dir: "tech-logo", ink: "#3776AB", stops: ["#3776AB", "#FFD43B"] },
  { file: "pytorch", name: "PyTorch", dir: "tech-logo", ink: "#EE4C2C", stops: ["#EE4C2C"] },
  { file: "typescript", name: "TypeScript", dir: "tech-logo", ink: "#3178C6", stops: ["#3178C6"] },
  { file: "cplusplus", name: "C++", dir: "tech-logo", ink: "#00599C", stops: ["#00599C"] },
  { file: "c", name: "C", dir: "tech-logo", ink: "#A8B9CC", stops: ["#A8B9CC"] },
  { file: "paddlepaddle", name: "PaddlePaddle", dir: "tech-logo", ink: "#0062B0", stops: ["#0062B0"] },
  { file: "ros", name: "ROS", dir: "tech-logo", ink: "#22314E", stops: ["#22314E"] },
  { file: "nvidia", name: "TensorRT / Xavier", dir: "tech-logo", ink: "#76B900", stops: ["#76B900"] },
  { file: "matlab", name: "Matlab / Simulink", dir: "tech-logo", ink: "#E16737", stops: ["#E16737", "#2299DD", "#EFC950"] },
  { file: "latex", name: "LaTeX", dir: "tech-logo", ink: "#008080", stops: ["#008080"] },
  { file: "markdown", name: "Markdown", dir: "tech-logo", ink: "#211d16", stops: ["#211d16"] },
];

const SPECIMENS: Specimen[] = [...MODELS, ...TOOLS];
const byFile = new Map(SPECIMENS.map((s) => [s.file, s]));

function logoSrc(s: Specimen): string {
  return s.dir === "model-logo" ? `/model-logo/${s.file}_color.svg` : `/tech-logo/${s.file}.svg`;
}

/** Mix a hex colour toward white (0..1). */
function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * amt);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(ch);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function featherStops(s: Specimen): string[] {
  return s.stops.length > 1 ? s.stops : [s.stops[0], lighten(s.stops[0], 0.4)];
}

function dyeAt(s: Specimen, dist: number): string {
  return s.stops.length > 1 ? s.stops[dist % s.stops.length] : s.ink;
}

/* ── Ring geometry (deterministic, shared with SSR) ────────────────────────
   Outer ring: the 18 model marks. Inner ring: the 11 tool marks, smaller
   and slightly offset in phase so the two rings interleave visually. */

interface RingMark extends Specimen {
  x: number;
  y: number;
  size: number;
  driftDur: number;
  driftDelay: number;
}

function ringOf(list: Specimen[], rx: number, ry: number, phase: number, sizes: number[]): RingMark[] {
  return list.map((s, i) => {
    const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2 + phase;
    return {
      ...s,
      x: Number((50 + rx * Math.cos(angle)).toFixed(2)),
      y: Number((50 + ry * Math.sin(angle)).toFixed(2)),
      size: sizes[i % sizes.length],
      driftDur: 7 + (i % 5) * 0.6,
      driftDelay: (i % 7) * 0.45,
    };
  });
}

const OUTER_RING = ringOf(MODELS, 47, 45, 0, [48, 36, 42]);
const INNER_RING = ringOf(TOOLS, 34, 31, Math.PI / TOOLS.length, [26, 22, 24]);

/* Compact strips for < md, where the absolute rings would collide with text. */
const MOBILE_MODELS = MODELS.slice(0, 10);
const MOBILE_TOOLS = TOOLS.slice(0, 8);

/* ── The masthead as letters ──────────────────────────────────────────────── */

const TITLE_LINES = ["THINK", "THINKING"];
const LETTERS: { ch: string; line: number }[] = TITLE_LINES.flatMap((line, li) =>
  line.split("").map((ch) => ({ ch, line: li })),
);

/* ── Egg state ────────────────────────────────────────────────────────────── */

interface Feather {
  dx: number;
  dy: number;
  rot: number;
  size: number;
  delay: number;
  clr: string;
  quill: boolean;
}

interface Flight {
  path: string;
  startSize: number;
  scale: number;
  dur: number;
}

interface Egg {
  file: string;
  count: number;
  letterIndex: number;
  phase: "flying" | "landed";
  flight: Flight | null;
  impact: { x: number; y: number } | null;
  feathers: Feather[];
}

function moltFeathers(stops: string[]): Feather[] {
  return Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 60 + Math.random() * 150;
    return {
      dx: Math.round(Math.cos(angle) * dist),
      dy: Math.round(Math.sin(angle) * dist * 0.8 - 30),
      rot: Math.round(-220 + Math.random() * 440),
      size: 4 + Math.round(Math.random() * 7),
      delay: Math.round(Math.random() * 120) / 1000,
      clr: stops[Math.floor(Math.random() * stops.length)],
      quill: Math.random() > 0.5,
    };
  });
}

const FLIGHT_MS = 620;

function pickLetterIndex(): number {
  return Math.floor(Math.random() * LETTERS.length);
}

function pickSpecimen(excludeFile: string | undefined): Specimen {
  const pool = SPECIMENS.filter((s) => s.file !== excludeFile);
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── One ring mark on its perch: rise-in, drift, click-to-fly ──────────────
   MODULE-LEVEL on purpose: defining this inside SpecimenPlate would mint a
   new component type every render, so each egg click would unmount/remount
   every mark and replay all the fg-rise entrances (the whole hero "flashes").
   Stable type + stable keys = the perches never re-enter. */

interface MarkButtonProps {
  "aria-label": string;
  onClick: (e: React.MouseEvent) => void;
  "data-away": true | undefined;
}

function RingMarkEl({
  s,
  delayIndex,
  markProps,
  setRef,
}: {
  s: RingMark;
  delayIndex: number;
  markProps: (file: string) => MarkButtonProps;
  setRef: (file: string, el: HTMLElement | null) => void;
}) {
  return (
    <div
      className="fg-rise absolute -translate-x-1/2 -translate-y-1/2"
      style={
        {
          left: `${s.x}%`,
          top: `${s.y}%`,
          "--fg-delay": `${0.15 + delayIndex * 0.04}s`,
        } as React.CSSProperties
      }
    >
      <div
        className="fg-drift"
        style={
          {
            "--fg-drift-dur": `${s.driftDur}s`,
            "--fg-drift-delay": `${s.driftDelay}s`,
          } as React.CSSProperties
        }
      >
        <button
          type="button"
          title={s.name}
          {...markProps(s.file)}
          ref={(el) => setRef(s.file, el)}
          className="fg-egg-mark pointer-events-auto cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fg-paper)]"
        >
          <Image
            src={logoSrc(s)}
            alt=""
            width={s.size}
            height={s.size}
            unoptimized
            className="drop-shadow-[0_2px_6px_rgba(33,29,22,0.12)]"
            style={{ width: s.size, height: s.size }}
          />
        </button>
      </div>
    </div>
  );
}

/* ── The plate ────────────────────────────────────────────────────────────── */

export function SpecimenPlate() {
  const t = useTranslations("hero");
  const [egg, setEgg] = useState<Egg | null>(null);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const letterRefs = useRef<(HTMLElement | null)[]>([]);
  const ringRefs = useRef<Map<string, HTMLElement>>(new Map());
  const stripRefs = useRef<Map<string, HTMLElement>>(new Map());
  const landTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (landTimer.current) clearTimeout(landTimer.current);
    },
    [],
  );

  const specimen = egg ? byFile.get(egg.file) : null;
  const specimenNo = egg
    ? String(SPECIMENS.findIndex((s) => s.file === egg.file) + 1).padStart(2, "0")
    : null;
  const landed = egg?.phase === "landed";

  function setRingRef(file: string, el: HTMLElement | null) {
    if (el) ringRefs.current.set(file, el);
    else ringRefs.current.delete(file);
  }

  function sourceMark(file: string): HTMLElement | null {
    for (const el of [ringRefs.current.get(file), stripRefs.current.get(file)]) {
      if (el && el.getBoundingClientRect().width > 0) return el;
    }
    return null;
  }

  function wear(file: string) {
    if (landTimer.current) clearTimeout(landTimer.current);

    const letterIndex = pickLetterIndex();
    const letterEl = letterRefs.current[letterIndex];
    const titleEl = titleRef.current;
    const src = sourceMark(file);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const count = (egg?.count ?? 0) + 1;
    const feathers = moltFeathers(featherStops(byFile.get(file)!));

    let flight: Flight | null = null;
    let impact: Egg["impact"] = null;

    if (letterEl && titleEl) {
      const tb = titleEl.getBoundingClientRect();
      const l = letterEl.getBoundingClientRect();
      impact = { x: l.left + l.width / 2 - tb.left, y: l.top + l.height / 2 - tb.top };

      if (src && !reduced) {
        const s = src.getBoundingClientRect();
        const sx = s.left + s.width / 2;
        const sy = s.top + s.height / 2;
        const ex = l.left + l.width / 2;
        const ey = l.top + l.height / 2;
        // Control point above the higher endpoint → a springy overhead arc.
        const cx = (sx + ex) / 2;
        const cy = Math.min(sy, ey) - Math.max(90, Math.abs(ex - sx) * 0.22);
        const startSize = Math.max(s.width, 28);
        flight = {
          path: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
          startSize,
          scale: (l.height * 0.72) / startSize,
          dur: FLIGHT_MS,
        };
      }
    }

    if (flight) {
      setEgg({ file, count, letterIndex, phase: "flying", flight, impact, feathers });
      landTimer.current = setTimeout(() => {
        setEgg((prev) =>
          prev && prev.count === count ? { ...prev, phase: "landed", flight: null } : prev,
        );
      }, FLIGHT_MS - 30);
    } else {
      setEgg({ file, count, letterIndex, phase: "landed", flight: null, impact, feathers });
    }
  }

  function borrowPlumage() {
    wear(pickSpecimen(egg?.file).file);
  }

  function markProps(file: string) {
    const away = egg?.file === file;
    const name = byFile.get(file)?.name ?? file;
    return {
      "aria-label": t("markAria", { name }),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        wear(file);
      },
      "data-away": away || undefined,
    };
  }

  return (
    <>
      {/* Mobile specimen strips (the rings need room): models, then tools. */}
      <div className="md:hidden">
        {[
          { list: MOBILE_MODELS, size: 28, delay: "0.1s" },
          { list: MOBILE_TOOLS, size: 22, delay: "0.2s" },
        ].map(({ list, size, delay }, gi) => (
          <ul
            key={gi}
            className="fg-rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 first:mt-8"
            style={{ "--fg-delay": delay } as React.CSSProperties}
          >
            {list.map((s) => (
              <li key={s.file}>
                <button
                  type="button"
                  title={s.name}
                  {...markProps(s.file)}
                  ref={(el) => {
                    if (el) stripRefs.current.set(s.file, el);
                    else stripRefs.current.delete(s.file);
                  }}
                  className="fg-egg-mark cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fg-paper)]"
                >
                  <Image
                    src={logoSrc(s)}
                    alt=""
                    width={size}
                    height={size}
                    unoptimized
                    style={{ width: size, height: size }}
                  />
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="relative flex min-h-[46vh] flex-col items-center justify-center py-14 text-center md:min-h-[86vh] md:py-0">
        {/* The rings (md+): two interleaved ellipses of marks, each drifting.
            The container swallows no clicks; each mark re-enables its own. */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {OUTER_RING.map((s, i) => (
            <RingMarkEl
              key={s.file}
              s={s}
              delayIndex={i}
              markProps={markProps}
              setRef={setRingRef}
            />
          ))}
          {INNER_RING.map((s, i) => (
            <RingMarkEl
              key={s.file}
              s={s}
              delayIndex={OUTER_RING.length + i}
              markProps={markProps}
              setRef={setRingRef}
            />
          ))}
        </div>

        {/* Title block — the masthead speaks in the index's outlined voice. */}
        <div className="relative flex max-w-3xl flex-col items-center gap-8">
          <p
            className="fg-rise text-[11px] font-medium uppercase tracking-[0.42em] text-[var(--fg-ink-soft)]"
            style={{ "--fg-delay": "0.2s" } as React.CSSProperties}
          >
            {t("kicker")}
          </p>

          <h1
            ref={titleRef}
            role="button"
            tabIndex={0}
            aria-label={t("titleAria")}
            onClick={borrowPlumage}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                borrowPlumage();
              }
            }}
            className="fg-rise fg-egg-perch fg-title-outline relative cursor-pointer select-none font-(family-name:--font-archivo-black) text-[clamp(3rem,8.6vw,6.6rem)] uppercase leading-[0.96] tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-ink)] focus-visible:ring-offset-8 focus-visible:ring-offset-[var(--fg-paper)]"
            style={{ "--fg-delay": "0.35s" } as React.CSSProperties}
          >
            {/* Impact FX: shockwave + feather burst, anchored to the crash
                site, re-keyed per click so they replay. */}
            {landed && egg?.impact && specimen && (
              <span
                key={`impact-${egg.count}`}
                aria-hidden
                className="pointer-events-none absolute"
                style={{ left: egg.impact.x, top: egg.impact.y }}
              >
                <span
                  className="fg-egg-shockwave"
                  style={{ "--egg-ink": specimen.ink } as React.CSSProperties}
                />
                {egg.feathers.map((f, i) => (
                  <span
                    key={i}
                    className="fg-egg-feather"
                    style={
                      {
                        "--egg-dx": `${f.dx}px`,
                        "--egg-dy": `${f.dy}px`,
                        "--egg-rot": `${f.rot}deg`,
                        "--egg-delay": `${f.delay}s`,
                        width: f.quill ? f.size * 0.55 : f.size,
                        height: f.quill ? f.size * 2.4 : f.size,
                        borderRadius: f.quill ? 3 : 999,
                        backgroundColor: f.clr,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            )}

            {TITLE_LINES.map((line, li) => {
              const offset = li === 0 ? 0 : TITLE_LINES[0].length;
              return (
                <span key={li} className="block">
                  {line.split("").map((ch, ci) => {
                    const idx = offset + ci;
                    const hit = landed && egg!.letterIndex === idx;
                    const dist = landed ? Math.abs(idx - egg!.letterIndex) : 0;
                    return (
                      <span
                        key={ci}
                        ref={(el) => {
                          letterRefs.current[idx] = el;
                        }}
                        className={`fg-letter relative${landed ? " fg-letter-dyed" : ""}`}
                        style={
                          landed
                            ? ({
                                "--dye": dyeAt(specimen!, dist),
                                "--dye-delay": `${dist * 60}ms`,
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {/* The struck glyph stays in the flow (invisible) so
                            kerning never shifts; the mark perches over it. */}
                        <span className={hit ? "opacity-0" : undefined}>{ch}</span>
                        {hit && (
                          <span
                            key={`perch-${egg!.count}`}
                            className="fg-letter-perch absolute inset-0 flex items-center justify-center"
                          >
                            <Image
                              src={logoSrc(specimen!)}
                              alt={specimen?.name ?? ""}
                              width={96}
                              height={96}
                              unoptimized
                              className="h-[0.74em] w-[0.74em] drop-shadow-[0_3px_10px_rgba(33,29,22,0.25)]"
                            />
                          </span>
                        )}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </h1>

          {/* The slogan — a hairline rule on each side, like a letterpress
              motto under the masthead. */}
          <p
            className="fg-rise flex items-center gap-4 text-[var(--fg-ink-soft)]"
            style={{ "--fg-delay": "0.55s" } as React.CSSProperties}
          >
            <span aria-hidden className="h-px w-10 bg-[var(--fg-ink)]/30 sm:w-16" />
            <span className="fg-note text-[17px] tracking-wide text-[var(--fg-ink)] sm:text-[19px]">
              Ideas Worth Spreading
            </span>
            <span aria-hidden className="h-px w-10 bg-[var(--fg-ink)]/30 sm:w-16" />
          </p>

          {/* Field-note tag: records the sighting without shifting layout. */}
          {landed && specimen && (
            <p
              key={egg!.count}
              className="fg-egg-tag absolute -bottom-14 left-1/2 flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--fg-ink)]/10 bg-[var(--fg-paper)]/85 px-4 py-1.5 backdrop-blur-sm"
            >
              <Image
                src={logoSrc(specimen)}
                alt=""
                width={16}
                height={16}
                unoptimized
                className="h-4 w-4"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-ink-soft)]">
                № {specimenNo}
              </span>
              <span className="fg-note text-[13px]" style={{ color: specimen.ink }}>
                {t("landed", { name: specimen.name })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* The flying bird: a fixed-position clone riding a quadratic offset-path
          arc from the perch to the letter, shrinking to letter size en route. */}
      {egg?.phase === "flying" && egg.flight && specimen && (
        <span
          key={`flight-${egg.count}`}
          aria-hidden
          className="fg-egg-flight pointer-events-none fixed left-0 top-0 z-50"
          style={
            {
              offsetPath: `path("${egg.flight.path}")`,
              offsetRotate: "0deg",
              "--fl-scale": egg.flight.scale,
              "--fl-dur": `${egg.flight.dur}ms`,
              width: egg.flight.startSize,
              height: egg.flight.startSize,
            } as React.CSSProperties
          }
        >
          <Image
            src={logoSrc(specimen)}
            alt=""
            width={egg.flight.startSize}
            height={egg.flight.startSize}
            unoptimized
            className="h-full w-full drop-shadow-[0_4px_12px_rgba(33,29,22,0.3)]"
          />
        </span>
      )}
    </>
  );
}
