"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const RARITY_LEVELS = 4;
const STAR_CURSOR_RADIUS = 34;

export function ColorWordmark() {
  const t = useTranslations("hero");
  const [rarity, setRarity] = useState(2);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.rarity;
    },
    [],
  );

  const shiftColor = () => {
    const next = (rarity % RARITY_LEVELS) + 1;
    setRarity(next);
    document.documentElement.dataset.rarity = String(next);
  };

  const moveCursor = (event: React.PointerEvent<HTMLButtonElement>) => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    cursor.style.transform = `translate3d(${event.clientX - STAR_CURSOR_RADIUS}px, ${event.clientY - STAR_CURSOR_RADIUS}px, 0)`;
  };

  const showCursor = (event: React.PointerEvent<HTMLButtonElement>) => {
    moveCursor(event);
    if (cursorRef.current) cursorRef.current.dataset.active = "true";
  };

  const hideCursor = () => {
    if (cursorRef.current) delete cursorRef.current.dataset.active;
  };

  return (
    <>
      <h1 id="hero-title">
        <button
          type="button"
          className="rare-wordmark-button"
          onClick={shiftColor}
          onPointerEnter={showCursor}
          onPointerMove={moveCursor}
          onPointerLeave={hideCursor}
          onPointerCancel={hideCursor}
          aria-label={t("colorAria")}
          data-rarity={rarity}
        >
          THINKTHINKING
        </button>
      </h1>

      <span ref={cursorRef} aria-hidden className="rare-wordmark-cursor">
        <svg className="rare-wordmark-star" viewBox="0 0 72 72" fill="none">
          <defs>
            <linearGradient id="dopamine-star" x1="8" y1="7" x2="65" y2="66">
              <stop stopColor="#ff23bf" />
              <stop offset="0.28" stopColor="#ff6b35" />
              <stop offset="0.52" stopColor="#ffe600" />
              <stop offset="0.74" stopColor="#20d9ff" />
              <stop offset="1" stopColor="#8b5cff" />
            </linearGradient>
          </defs>
          <path
            fill="url(#dopamine-star)"
            stroke="#fff"
            strokeWidth="1.5"
            d="M36 1 43 24 63 9 48 29 71 36 48 43 63 63 43 48 36 71 29 48 9 63 24 43 1 36 24 29 9 9 29 24 36 1Z"
          />
          <circle cx="36" cy="36" r="12" fill="#ff23bf" />
          <circle cx="36" cy="36" r="5" fill="#f2ff3d" />
        </svg>
      </span>
    </>
  );
}
