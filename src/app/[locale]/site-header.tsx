"use client";

// The masthead: avatar + wordmark on the left; every contact channel on the
// right — X / GitHub as plain outbound links, 小红书 and WeChat revealing QR
// popovers (opening downward, we're at the top of the page), Email copying
// the address on click — plus the language switch. Ported from the Arena
// AuthorCard and re-voiced for the field-guide palette.

import { useId, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TWITTER_URL = "https://x.com/thinkthinking_";
const GITHUB_URL = "https://github.com/thinkthinking";
const REDNOTE_URL = "https://www.xiaohongshu.com/user/profile/6401506e0000000029017abc";
const EMAIL = "yezhenjie@zenmux.ai";
const WECHAT_IMG = "https://cdn.marmot-cloud.com/storage/zenmux/2026/01/23/fNSKOaq/wechat.png";

/** Shared trigger styling — every action fills one square of the masthead. */
const TRIGGER_CLASS =
  "inline-flex size-full min-h-11 items-center justify-center bg-transparent text-[var(--fg-ink)] transition-colors duration-200 hover:bg-white/55 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fg-ink)]";

function BrandIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image src={src} alt={alt} width={18} height={18} unoptimized className="size-[18px] object-contain" />
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function MailMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** A contact icon that reveals a floating panel (QR / text) on hover or
    keyboard focus — opening DOWNWARD from the masthead. With `href` the
    trigger is a real outbound link (touch fallback); with `onClick` it's a
    button (e.g. copy email, no nav). */
function PopoverIcon({
  label,
  href,
  onClick,
  trigger,
  children,
  panelClass = "",
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  panelClass?: string;
}) {
  const id = useId();
  return (
    <div className="group/icon relative size-full">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          aria-describedby={id}
          className={TRIGGER_CLASS}
        >
          {trigger}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-describedby={id}
          className={`${TRIGGER_CLASS} cursor-pointer`}
        >
          {trigger}
        </button>
      )}
      <div
        id={id}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-2 origin-top-right scale-95 opacity-0 transition-all duration-150 group-hover/icon:pointer-events-auto group-hover/icon:scale-100 group-hover/icon:opacity-100 group-focus-within/icon:pointer-events-auto group-focus-within/icon:scale-100 group-focus-within/icon:opacity-100 motion-reduce:transition-none"
      >
        <div className="rounded-xl border border-[var(--fg-ink)]/20 bg-white/95 p-2 shadow-[0_8px_24px_rgba(33,29,22,0.18)] backdrop-blur">
          <div className={panelClass}>{children}</div>
          <div className="mt-1.5 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--fg-ink-soft)]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ qrSvg }: { qrSvg: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "zh" ? "en" : "zh";

  const [copied, setCopied] = useState(false);
  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="fg-site-header-grid relative z-20 grid w-full border-y border-[var(--fg-line-strong)]">
      {/* Identity — avatar, name and field note each occupy exact cells. */}
      <div className="contents">
        <div className="fg-header-avatar-cell flex items-center justify-center border-r border-[var(--fg-line-strong)]">
          <Image
            src="/thinkthinking/selfie.jpg"
            alt="thinkthinking"
            width={80}
            height={80}
            priority
            className="size-10 shrink-0 rounded-full border border-[var(--fg-ink)]/25 object-cover"
          />
        </div>
        <div className="fg-header-name-cell flex min-w-0 items-center border-r border-[var(--fg-line-strong)] px-4 sm:px-5">
          <span className="truncate font-(family-name:--font-archivo-black) text-sm tracking-tight">
            thinkthinking<span className="text-[var(--fg-ink-soft)]">.ai</span>
          </span>
        </div>
        <div className="fg-header-meta-cell hidden items-center border-r border-[var(--fg-line-strong)] px-5 lg:flex">
          <span aria-hidden className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--fg-ink-soft)]">
            Personal index · Singapore
          </span>
        </div>
      </div>

      {/* Contact row + language switch — exactly one square per action. */}
      <div className="fg-header-actions contents">
        <a
          href={TWITTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("twitter")}
          title={t("twitter")}
          className={TRIGGER_CLASS}
        >
          <XMark />
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("github")}
          title={t("github")}
          className={TRIGGER_CLASS}
        >
          <GithubMark />
        </a>

        <PopoverIcon
          label={t("rednote")}
          href={REDNOTE_URL}
          trigger={<BrandIcon src="/media-logo/rednote.svg" alt={t("rednote")} />}
          panelClass="size-40 [&>div>svg]:size-full"
        >
          {/* QR SVG generated server-side; safe (our own string, no user input). */}
          <div className="size-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </PopoverIcon>

        <PopoverIcon
          label={t("wechat")}
          href={WECHAT_IMG}
          trigger={<BrandIcon src="/media-logo/wechat.svg" alt={t("wechat")} />}
          panelClass="size-40"
        >
          {/* The QR is a square image — show it complete, not cropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WECHAT_IMG} alt="WeChat QR" className="size-full object-contain" />
        </PopoverIcon>

        <PopoverIcon label={t("email")} onClick={copyEmail} trigger={<MailMark />} panelClass="px-1">
          <button
            type="button"
            onClick={copyEmail}
            title={t("copyHint")}
            className="cursor-pointer select-all font-mono text-[12px] tracking-tight text-[var(--fg-ink)]"
          >
            {EMAIL}
          </button>
          {copied && (
            <div className="mt-0.5 text-center text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--fg-green)]">
              {t("copied")}
            </div>
          )}
        </PopoverIcon>

        {/* Language switch — the same page, the other tongue. */}
        <Link
          href={pathname}
          locale={otherLocale}
          aria-label={t("langSwitchLabel")}
          title={t("langSwitchLabel")}
          className="inline-flex size-full min-h-11 items-center justify-center px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--fg-ink)] transition-colors duration-200 hover:bg-[var(--fg-ink)] hover:text-[var(--fg-paper)] focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fg-ink)] sm:text-[11px] sm:tracking-[0.15em]"
        >
          {t("langSwitch")}
        </Link>
      </div>
    </header>
  );
}
