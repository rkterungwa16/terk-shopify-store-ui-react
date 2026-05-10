"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import "./styles.css";

type HeaderSettings = {
  showSearch?: boolean;
  searchPosition?: "left" | "right";
  searchRow?: "top" | "bottom";

  showCountry?: boolean;
  showLanguage?: boolean;

  localizationPosition?: "left" | "right";
  localizationRow?: "top" | "bottom";

  menuRow?: "top" | "bottom";

  sectionWidth?: "page-width" | "full-width";
  sectionHeight?: "compact" | "standard";

  enableStickyHeader?: "always" | "scroll-up" | "none";

  enableTransparentHeaderHome?: boolean;
  enableTransparentHeaderProduct?: boolean;
  enableTransparentHeaderCollection?: boolean;

  templateName?: "index" | "product" | "collection" | string;

  actionsDisplayStyle?: "icon" | "text";

  colorSchemeTop?: string;
  colorSchemeBottom?: string;
  colorSchemeTransparent?: string;

  dividerWidth?: number;
  borderWidth?: number;

  customerAccountsEnabled?: boolean;
};

type HeaderProps = {
  settings: HeaderSettings;

  logo?: React.ReactNode;
  menu?: React.ReactNode;
  mobileMenu?: React.ReactNode;
  navigationBar?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
  localization?: React.ReactNode;

  className?: string;
};

const DEFAULT_ORDER = [
  "logo",
  "menu",
  "localization",
  "search",
  "drawer_search",
  "actions",
];

export default function ShopifyHeader({
  settings,
  logo,
  menu,
  mobileMenu,
  navigationBar,
  search,
  actions,
  localization,
  className,
}: HeaderProps) {
  const [stickyActive, setStickyActive] = useState(false);

  /**
   * ---------------------------------------------------
   * Transparent Header Logic
   * ---------------------------------------------------
   */
  const transparent = useMemo(() => {
    if (
      settings.enableTransparentHeaderHome &&
      settings.templateName === "index"
    ) {
      return "always";
    }

    if (
      settings.enableTransparentHeaderProduct &&
      settings.templateName === "product"
    ) {
      return "always";
    }

    if (
      settings.enableTransparentHeaderCollection &&
      settings.templateName === "collection"
    ) {
      return "always";
    }

    return undefined;
  }, [settings]);

  /**
   * ---------------------------------------------------
   * Sticky Header Logic
   * ---------------------------------------------------
   */
  const sticky = useMemo(() => {
    if (settings.enableStickyHeader === "always") {
      return "always";
    }

    if (settings.enableStickyHeader === "scroll-up") {
      return "scroll-up";
    }

    return undefined;
  }, [settings]);

  /**
   * ---------------------------------------------------
   * Dynamic Order Logic
   * ---------------------------------------------------
   */
  const order = useMemo(() => {
    let computed = [...DEFAULT_ORDER];

    if (settings.customerAccountsEnabled) {
      computed = [
        "drawer_search",
        "logo",
        "menu",
        "localization",
        "search",
        "actions",
      ];
    }

    if (settings.localizationPosition === "left") {
      if (settings.searchPosition === "left") {
        computed = settings.customerAccountsEnabled
          ? [
              "drawer_search",
              "logo",
              "search",
              "localization",
              "menu",
              "actions",
            ]
          : [
              "logo",
              "search",
              "localization",
              "menu",
              "drawer_search",
              "actions",
            ];
      } else {
        computed = settings.customerAccountsEnabled
          ? [
              "drawer_search",
              "logo",
              "localization",
              "menu",
              "search",
              "actions",
            ]
          : [
              "logo",
              "localization",
              "menu",
              "search",
              "drawer_search",
              "actions",
            ];
      }
    } else if (settings.searchPosition === "left") {
      computed = settings.customerAccountsEnabled
        ? ["drawer_search", "logo", "search", "menu", "localization", "actions"]
        : [
            "logo",
            "search",
            "menu",
            "localization",
            "drawer_search",
            "actions",
          ];
    }

    return computed;
  }, [settings]);

  /**
   * ---------------------------------------------------
   * Sticky Scroll Behaviour
   * ---------------------------------------------------
   */
  useEffect(() => {
    if (!sticky) return;

    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (sticky === "always") {
        setStickyActive(currentY > 10);
        return;
      }

      if (sticky === "scroll-up") {
        const isScrollingUp = currentY < lastY;

        setStickyActive(isScrollingUp && currentY > 100);

        lastY = currentY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sticky]);

  /**
   * ---------------------------------------------------
   * Bottom Row Detection
   * ---------------------------------------------------
   */
  const bottomRowBlocks = useMemo(() => {
    const blocks: string[] = [];

    if (settings.menuRow === "bottom") {
      blocks.push("menu");
    }

    if (settings.showSearch && settings.searchRow === "bottom") {
      blocks.push("search");
    }

    if (
      (settings.showCountry || settings.showLanguage) &&
      settings.localizationRow === "bottom"
    ) {
      blocks.push("localization");
    }

    return blocks;
  }, [settings]);

  /**
   * ---------------------------------------------------
   * Slot Registry
   * ---------------------------------------------------
   */
  const slots: Record<string, React.ReactNode> = {
    logo,
    menu,
    search,
    actions,
    localization,
    drawer_search: mobileMenu,
  };

  /**
   * ---------------------------------------------------
   * Render Helpers
   * ---------------------------------------------------
   */
  const renderRow = (row: "top" | "bottom") => {
    const content = order
      .filter((item) => {
        if (row === "top") {
          if (bottomRowBlocks.includes(item.replace("drawer_", ""))) {
            return false;
          }

          return true;
        }

        return bottomRowBlocks.includes(item.replace("drawer_", ""));
      })
      .map((item) => <React.Fragment key={item}>{slots[item]}</React.Fragment>);

    if (!content.length) return null;

    return (
      <div
        className={clsx(
          "header__row",
          `header__row--${row}`,
          settings.sectionWidth === "page-width"
            ? "section--page-width"
            : "section--full-width",
          {
            "mobile:hidden": row === "bottom",
          },
        )}
      >
        <div className="header__columns">{content}</div>
      </div>
    );
  };

  return (
    <>
      <header
        id="header-component"
        className={clsx("header", className, {
          "header--compact": settings.sectionHeight === "compact",

          "header--transparent": !!transparent,

          "header--sticky": !!sticky,

          "is-sticky-active": stickyActive,
        })}
        data-transparent={transparent}
        data-sticky={sticky}
      >
        {/* Underlays */}
        <div className="header__underlay header__underlay--closed" />
        <div className="header__underlay header__underlay--open" />

        {/* Top Row */}
        {renderRow("top")}

        {/* Bottom Row */}
        {bottomRowBlocks.length > 0 && renderRow("bottom")}

        {/* Navigation Bar */}
        {navigationBar && (
          <div className="header__navigation-bar-row">{navigationBar}</div>
        )}
      </header>
    </>
  );
}
