import React, { useMemo, useState } from "react";

interface Link {
  title: string;
  url: string;
  current?: boolean;
  active?: boolean;
  links?: Link[];
}

/**
 * React equivalent of Shopify Liquid Header Menu system
 * - Supports: mobile drawer, navigation bar, desktop mega menu
 * - Simplified overflow + submenu logic
 * - Focus on architecture fidelity over pixel-perfect parity
 */

// -----------------------------
// Types
// -----------------------------

/**
 * @typedef Link
 * @property {string} title
 * @property {string} url
 * @property {boolean} [current]
 * @property {boolean} [active]
 * @property {Link[]} [links]
 */

/**
 * @typedef MenuProps
 * @property {"mobile" | "navigation_bar" | "desktop"} variant
 * @property {Link[]} links
 * @property {boolean} [transparent]
 */

// -----------------------------
// Helpers
// -----------------------------

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function hasChildren(link: Link) {
  return Array.isArray(link.links) && link.links.length > 0;
}

// -----------------------------
// Mobile Drawer
// -----------------------------

function MobileDrawer({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center min-h-[60px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 text-sm font-medium"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4 border-b flex justify-between">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>

          <ul className="p-4 space-y-3">
            {links.map((link) => (
              <li key={link.title}>
                <a href={link.url} className="block py-2">
                  {link.title}
                </a>

                {hasChildren(link) && (
                  <ul className="pl-4 mt-2 space-y-2 text-sm opacity-80">
                    {link.links?.map((sublink) => (
                      <li key={sublink.title}>
                        <a href={sublink.url}>{sublink.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// -----------------------------
// Navigation Bar (mobile horizontal scroll)
// -----------------------------

function NavigationBar({ links }: { links: Link[] }) {
  return (
    <div className="overflow-x-auto whitespace-nowrap border-b">
      <ul className="flex gap-4 px-4 py-2">
        {links.map((link) => (
          <li key={link.title} className="inline-block">
            <a
              href={link.url}
              className={classNames(
                "text-sm font-medium",
                link.current ? "underline" : "",
              )}
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -----------------------------
// Mega Menu Item
// -----------------------------

function MegaMenuItem({ link }: { link: Link }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={link.url}
        className={classNames(
          "px-3 py-2 block text-sm",
          link.active ? "font-semibold" : "",
        )}
      >
        {link.title}
      </a>

      {hasChildren(link) && open && (
        <div className="absolute left-0 top-full w-screen bg-white border-t shadow-lg z-40">
          <div className="max-h-[80vh] overflow-auto p-8 grid grid-cols-4 gap-6">
            {link.links?.map((child) => (
              <div key={child.title}>
                <a href={child.url} className="block font-medium mb-2">
                  {child.title}
                </a>

                {hasChildren(child) && (
                  <ul className="space-y-1 text-sm opacity-80">
                    {child.links?.map((grand) => (
                      <li key={grand.title}>
                        <a href={grand.url}>{grand.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

// -----------------------------
// Desktop Mega Menu
// -----------------------------

function DesktopMenu({ links }: { links: Link[] }) {
  return (
    <nav className="hidden md:block w-full">
      <ul className="flex gap-6 items-center">
        {links?.map((link) => (
          <MegaMenuItem key={link.title} link={link} />
        ))}
      </ul>
    </nav>
  );
}

// -----------------------------
// Main Header Menu Component
// -----------------------------

export default function HeaderMenu({
  variant = "desktop",
  links = [],
  transparent,
}: {
  variant: "mobile" | "navigation_bar" | "desktop";
  links?: Link[];
  transparent?: boolean;
}) {
  const content = useMemo(() => {
    switch (variant) {
      case "mobile":
        return <MobileDrawer links={links} />;

      case "navigation_bar":
        return <NavigationBar links={links} />;

      default:
        return <DesktopMenu links={links} />;
    }
  }, [variant, links]);

  return (
    <header
      className={classNames(
        "w-full",
        transparent ? "bg-transparent" : "bg-white border-b",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="font-bold py-4">Logo</div>
        {content}
      </div>
    </header>
  );
}
