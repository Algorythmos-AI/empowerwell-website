import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Phone, CalendarCheck, Shield } from "lucide-react";
import type { NavLink } from "../../content/site";

interface MobileMenuProps {
  navLinks: NavLink[];
  currentPath: string;
  phone: string;
  phoneHref: string;
  referral: NavLink;
  brandName: string;
  registrationLabel: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mobile slide-out navigation (below the xl breakpoint, 1280px).
 *
 * The panel is portalled to <body> because the sticky header uses backdrop-filter, which would
 * otherwise become the containing block for position:fixed and clip the panel to the header.
 * While open: focus is trapped in the panel, the rest of the page is inert, body scroll is locked,
 * Escape closes it, and focus returns to the toggle button on close.
 */
export default function MobileMenu({
  navLinks,
  currentPath,
  phone,
  phoneHref,
  referral,
  brandName,
  registrationLabel,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setIsOpen(false), []);

  // Close automatically if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 80rem)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setIsOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpen.current) toggleRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;

    const portalRoot = panelRef.current?.closest("[data-mobile-menu-root]");
    const background = Array.from(document.body.children).filter(
      (el) => el !== portalRoot && el.tagName !== "SCRIPT",
    ) as HTMLElement[];
    background.forEach((el) => el.setAttribute("inert", ""));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      background.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const isActive = (href: string) => currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));

  const panel = (
    <div data-mobile-menu-root>
      <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-surface p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-green-100">
            <span className="font-heading font-extrabold text-green-900 text-lg">{brandName}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="p-2 text-purple-700 hover:bg-purple-50 rounded-full focus-visible:outline-3 focus-visible:outline-purple-700 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-6" aria-label="Main">
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`px-4 py-3 rounded-[12px] text-lg font-bold hover:text-purple-700 hover:bg-surface-tint focus-visible:outline-3 focus-visible:outline-purple-700 min-h-[44px] flex items-center transition-colors ${
                      isActive(link.href) ? "text-purple-700 bg-surface-tint" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-6 border-t border-green-100 space-y-3">
          <a
            href={phoneHref}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-surface-tint text-purple-700 font-bold border-2 border-purple-700 hover:bg-purple-50 min-h-[44px] transition-colors focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>Call {phone}</span>
          </a>
          <a
            href={referral.href}
            onClick={close}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-green-900 text-white font-bold hover:bg-green-800 min-h-[44px] shadow-soft transition-colors focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2"
          >
            <CalendarCheck className="w-5 h-5" aria-hidden="true" />
            <span>{referral.label}</span>
          </a>
          <p className="pt-2 text-center text-xs text-muted flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-700" aria-hidden="true" />
            <span>{registrationLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="xl:hidden js-only">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="inline-flex items-center justify-center p-2.5 rounded-full text-purple-700 hover:bg-purple-50 focus-visible:outline-3 focus-visible:outline-purple-700 min-w-[44px] min-h-[44px] cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
      </button>
      {/* isOpen only becomes true after a click, so this never runs during server rendering. */}
      {isOpen && createPortal(panel, document.body)}
    </div>
  );
}
