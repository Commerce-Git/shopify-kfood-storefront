"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const POLICY_LINKS = [
  { href: "/policies/shipping", label: "Shipping Policy" },
  { href: "/policies/returns", label: "Return Policy" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/terms", label: "Terms of Service" },
];

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-[#FBF9F5]">
      <div className="section">
        <div className="section-inner">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <h2
                className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Policies
              </h2>
              <nav className="space-y-1">
                {POLICY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-text-muted hover:bg-surface-dim hover:text-dark"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-dark
                prose-p:text-text-muted prose-p:leading-relaxed
                prose-li:text-text-muted
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-dark
              "
                style={{ fontFamily: "var(--font-body)" }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
