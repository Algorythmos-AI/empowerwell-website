import { useState, useEffect } from "react";
import { Menu, X, Phone, CalendarCheck, Shield } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  phone: string;
  phoneHref: string;
}

export default function MobileMenu({ navLinks, phone, phoneHref }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Close main menu" : "Open main menu"}
        className="inline-flex items-center justify-center p-2.5 rounded-full text-purple-700 hover:bg-purple-50 focus-visible:outline-3 focus-visible:outline-purple-700 min-w-[44px] min-h-[44px] cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu Panel */}
      {isOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-surface p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          <div>
            {/* Top Close Row */}
            <div className="flex items-center justify-between pb-6 border-b border-green-100">
              <span className="font-heading font-extrabold text-green-900 text-lg">
                Empowerwell Support
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-2 text-purple-700 hover:bg-purple-50 rounded-full focus-visible:outline-3 focus-visible:outline-purple-700 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 flex flex-col space-y-2" aria-label="Mobile Navigation Links">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-[12px] text-lg font-bold text-ink hover:text-purple-700 hover:bg-surface-tint focus-visible:outline-3 focus-visible:outline-purple-700 min-h-[44px] flex items-center transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-green-100 space-y-3">
            {/* Quick Call */}
            <a
              href={phoneHref}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-surface-tint text-purple-700 font-bold border-2 border-purple-700 hover:bg-purple-50 min-h-[44px] transition-colors"
            >
              <Phone className="w-5 h-5 text-purple-700" aria-hidden="true" />
              <span>Call {phone}</span>
            </a>

            {/* Referral Button */}
            <a
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-green-900 text-white font-bold hover:bg-green-800 min-h-[44px] shadow-soft transition-colors"
            >
              <CalendarCheck className="w-5 h-5" aria-hidden="true" />
              <span>Make a Referral</span>
            </a>

            {/* Registration Trust Tag */}
            <div className="pt-2 text-center text-xs text-muted flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
              <span>Registered NDIS Provider · 4-LCYP0SK</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
