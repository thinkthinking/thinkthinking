"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TWITTER_URL = "https://x.com/thinkthinking_";
const GITHUB_URL = "https://github.com/thinkthinking";
const REDNOTE_URL =
  "https://www.xiaohongshu.com/user/profile/6401506e0000000029017abc";
const EMAIL = "yezhenjie@zenmux.ai";
const WECHAT_IMG =
  "https://cdn.marmot-cloud.com/storage/zenmux/2026/01/23/fNSKOaq/wechat.png";

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function MailMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SocialPopover({
  label,
  href,
  icon,
  children,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();

  return (
    <span className="rare-social-popover">
      <a
        className="rare-social-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        aria-describedby={id}
        title={label}
      >
        {icon}
      </a>
      <span id={id} role="tooltip" className="rare-social-panel">
        {children}
        <span className="rare-social-panel-label">{label}</span>
      </span>
    </span>
  );
}

function SocialIconNav({
  qrSvg,
  copied,
  onCopyEmail,
  languageSwitch,
  className = "",
}: {
  qrSvg: string;
  copied: boolean;
  onCopyEmail: () => void;
  languageSwitch?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("header");

  return (
    <nav className={`rare-utility-nav ${className}`} aria-label="Social links">
      <a
        className="rare-social-link"
        href={TWITTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("twitter")}
        title={t("twitter")}
      >
        <XMark />
      </a>
      <a
        className="rare-social-link"
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("github")}
        title={t("github")}
      >
        <GithubMark />
      </a>
      <SocialPopover
        label={t("rednote")}
        href={REDNOTE_URL}
        icon={<Image src="/media-logo/rednote.svg" alt="" width={18} height={18} />}
      >
        <span className="rare-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      </SocialPopover>
      <SocialPopover
        label={t("wechat")}
        href={WECHAT_IMG}
        icon={<Image src="/media-logo/wechat.svg" alt="" width={18} height={18} />}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={WECHAT_IMG}
          alt="WeChat QR"
          width="160"
          height="160"
          loading="lazy"
        />
      </SocialPopover>
      <button
        type="button"
        onClick={onCopyEmail}
        className="rare-social-link"
        aria-label={copied ? t("copied") : t("email")}
        title={copied ? t("copied") : t("copyHint")}
      >
        <MailMark />
      </button>
      {languageSwitch}
    </nav>
  );
}

export function FooterSocialLinks({ qrSvg }: { qrSvg: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "zh" ? "en" : "zh";
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rare-footer-social-links">
      <SocialIconNav
        qrSvg={qrSvg}
        copied={copied}
        onCopyEmail={copyEmail}
        className="rare-footer-social-icons"
        languageSwitch={
          <Link
            className="rare-lang-link"
            href={pathname}
            locale={otherLocale}
            aria-label={t("langSwitchLabel")}
          >
            {t("langSwitch")}
          </Link>
        }
      />
      <span className="rare-sr-only" aria-live="polite">
        {copied ? t("copied") : ""}
      </span>
    </div>
  );
}

export function SiteHeader({ qrSvg }: { qrSvg: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "zh" ? "en" : "zh";
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="rare-header">
      <div className="rare-header-intro">
        <Image
          src="/thinkthinking/selfie.jpg"
          alt="thinkthinking"
          width={72}
          height={72}
          priority
          className="rare-header-avatar"
        />
        <span className="rare-header-motto">Ideas Worth Spreading</span>
      </div>

      <div className="rare-header-tools">
        <SocialIconNav
          qrSvg={qrSvg}
          copied={copied}
          onCopyEmail={copyEmail}
          languageSwitch={
            <Link
              className="rare-lang-link"
              href={pathname}
              locale={otherLocale}
              aria-label={t("langSwitchLabel")}
            >
              {t("langSwitch")}
            </Link>
          }
        />
        <span className="rare-sr-only" aria-live="polite">
          {copied ? t("copied") : ""}
        </span>
      </div>
    </header>
  );
}
