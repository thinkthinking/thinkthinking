"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const POSTER_URL =
  "https://static.zenmux.ai/public/images/thinkthinking/redpacket-FTCNOW-poster.png";

export function RedpacketDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("hero.redpacket");
  const titleId = useId();
  const hintId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="rare-redpacket-dialog"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) {
          onClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="rare-redpacket-header">
        <h2 id={titleId}>{t("title")}</h2>
        <button
          type="button"
          className="rare-redpacket-close"
          onClick={onClose}
          aria-label={t("close")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {imageFailed ? (
        <p className="rare-redpacket-error" role="alert">{t("error")}</p>
      ) : (
        <Image
          className="rare-redpacket-poster"
          src={POSTER_URL}
          alt={t("imageAlt")}
          width={1920}
          height={1080}
          unoptimized
          loading="eager"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="rare-redpacket-footer">
        <p id={hintId}>{t("hint")}</p>
        <a href={POSTER_URL} target="_blank" rel="noopener noreferrer">
          {t("openImage")} <span aria-hidden>↗</span>
        </a>
      </div>
    </dialog>
  );
}
