import { useState, type MouseEvent } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FaqAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
}

export default function FaqAccordion({ items, allowMultiple = true }: FaqAccordionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    [items[0]?.id || ""]: true, // Open first item by default for discoverability
  });

  const toggleItem = (id: string, e: MouseEvent) => {
    // If native details toggle is handled by JS:
    e.preventDefault();
    setOpenItems((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      }
      return { [id]: !prev[id] };
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = !!openItems[item.id];
        return (
          <details
            key={item.id}
            open={isOpen}
            className="group rounded-[12px] border border-border-card bg-white shadow-soft transition-all overflow-hidden"
          >
            <summary
              onClick={(e) => toggleItem(item.id, e)}
              className="flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer list-none select-none focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2 min-h-[44px]"
              aria-expanded={isOpen}
            >
              <h3 className="text-lg sm:text-xl font-bold text-ink group-hover:text-purple-700 transition-colors m-0 text-left">
                {item.question}
              </h3>
              <span
                className={`p-2 rounded-full bg-surface-tint text-purple-700 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 bg-purple-100" : ""
                }`}
                aria-hidden="true"
              >
                <ChevronDown className="w-5 h-5" />
              </span>
            </summary>

            <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-ink leading-relaxed border-t border-green-50/60 whitespace-pre-line text-base sm:text-lg">
              {item.answer}
            </div>
          </details>
        );
      })}
    </div>
  );
}
