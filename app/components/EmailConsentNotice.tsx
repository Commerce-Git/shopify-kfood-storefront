import React from "react";
import Link from "next/link";

interface EmailConsentNoticeProps {
  align?: "center" | "left";
  className?: string;
  compact?: boolean;
  showLock?: boolean;
}

/**
 * Standardized legal compliance notice for all email capture forms.
 * Complies with:
 * - US CAN-SPAM Act & FTC Deceptive Practices Rules (Unsubscribe anytime notice)
 * - California CCPA / CPRA & CalOPPA (Notice at Collection with Privacy Policy link)
 * - EU & UK GDPR Articles 7(3) & 13 (Informed consent & withdrawal rights)
 * - Opens Privacy Policy in a new tab to preserve customer checkout & cart state.
 */
export default function EmailConsentNotice({
  align = "center",
  className = "",
  compact = false,
  showLock = true,
}: EmailConsentNoticeProps) {
  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const sizeClass = compact
    ? "text-[10px] sm:text-[11px] leading-tight text-[#71717A]"
    : "text-[11px] sm:text-xs leading-normal text-[#71717A]";

  return (
    <p className={`${sizeClass} ${alignmentClass} ${className} flex items-center ${align === "center" ? "justify-center" : "justify-start"} flex-wrap`}>
      {showLock && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3 mr-1 text-[#A1A1AA] shrink-0"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      <span>No spam. Unsubscribe anytime. View our&nbsp;</span>
      <Link
        href="/policies/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-[#18181B] font-medium transition-colors"
      >
        Privacy Policy
      </Link>
      <span>.</span>
    </p>
  );
}
