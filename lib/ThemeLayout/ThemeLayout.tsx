import React, { useEffect } from "react";

import "./styles.css";

type LayoutSettings = {
  favicon?: string;
  transitionToMainProduct?: boolean;
  pageTransitionEnabled?: boolean;
  pageWidth?: string;
  cardHoverEffect?: string;
  quickAdd?: boolean;
  mobileQuickAdd?: boolean;
};

type RequestData = {
  designMode?: boolean;
  locale?: {
    isoCode?: string;
  };
};

type ThemeLayoutProps = {
  settings: LayoutSettings;
  request: RequestData;
  template?: string;

  /**
   * Replaces Shopify `content_for_header`
   */
  headerContent?: React.ReactNode;

  /**
   * Replaces Shopify `content_for_layout`
   */
  children: React.ReactNode;

  /**
   * Layout partials / slots
   */
  metaTags?: React.ReactNode;
  stylesheets?: React.ReactNode;
  fonts?: React.ReactNode;
  scripts?: React.ReactNode;
  themeStyleVariables?: React.ReactNode;
  colorSchemes?: React.ReactNode;
  themeEditor?: React.ReactNode;

  headerGroup?: React.ReactNode;
  footerGroup?: React.ReactNode;

  searchModal?: React.ReactNode;
  quickAddModal?: React.ReactNode;

  skipToContentLink?: React.ReactNode;
};

const ThemeLayout: React.FC<ThemeLayoutProps> = ({
  settings,
  request,
  template,

  headerContent,
  children,

  metaTags,
  stylesheets,
  fonts,
  scripts,
  themeStyleVariables,
  colorSchemes,
  themeEditor,

  headerGroup,
  footerGroup,

  searchModal,
  quickAddModal,

  skipToContentLink,
}) => {
  /**
   * Header height + transparent header calculations
   */
  useEffect(() => {
    const setHeaderHeightCustomProperties = () => {
      const header = document.querySelector(
        "header-component",
      ) as HTMLElement | null;

      const headerGroup = document.querySelector(
        "#header-group",
      ) as HTMLElement | null;

      const hasHeaderSection = headerGroup?.querySelector(".header-section");

      if (!header || !headerGroup) return;

      const headerTopRow = header.querySelector(
        ".header__row--top",
      ) as HTMLElement | null;

      const headerHeight = header.offsetHeight;

      /**
       * Calculate total header group height
       */
      let headerGroupHeight = 0;

      const children = headerGroup.children;

      for (let i = 0; i < children.length; i++) {
        const element = children[i] as HTMLElement;

        if (element === header || !(element instanceof HTMLElement)) {
          continue;
        }

        headerGroupHeight += element.offsetHeight;
      }

      /**
       * Transparent header handling
       */
      if (
        header.hasAttribute("transparent") &&
        header.parentElement?.nextElementSibling
      ) {
        headerGroupHeight += headerHeight;
      }

      /**
       * Set CSS variables
       */
      document.body.style.setProperty("--header-height", `${headerHeight}px`);

      document.body.style.setProperty(
        "--header-group-height",
        `${headerGroupHeight}px`,
      );

      if (headerTopRow) {
        window.requestAnimationFrame(() => {
          document.body.style.setProperty(
            "--top-row-height",
            `${headerTopRow.offsetHeight}px`,
          );
        });
      }

      /**
       * Transparent header offset logic
       */
      if (!hasHeaderSection || !header.hasAttribute("transparent")) {
        document.body.style.setProperty(
          "--transparent-header-offset-boolean",
          "0",
        );

        return;
      }

      const hasImmediateSection =
        hasHeaderSection.nextElementSibling?.classList.contains(
          "shopify-section",
        );

      const shouldApplyOffset = !hasImmediateSection ? "1" : "0";

      document.body.style.setProperty(
        "--transparent-header-offset-boolean",
        shouldApplyOffset,
      );
    };

    const setHeaderMenuStyle = () => {
      const headerComponent = document.querySelector(
        "#header-component",
      ) as HTMLElement | null;

      if (!headerComponent) return;

      const isTouchDevice =
        "ontouchstart" in window && navigator.maxTouchPoints > 0;

      const overflowList = headerComponent.querySelector("overflow-list");

      const hasReachedMinimum = overflowList?.hasAttribute("minimum-reached");

      headerComponent.dataset.menuStyle =
        isTouchDevice || hasReachedMinimum ? "drawer" : "menu";
    };

    setHeaderHeightCustomProperties();
    setHeaderMenuStyle();

    /**
     * Recalculate on resize
     */
    window.addEventListener("resize", setHeaderHeightCustomProperties);

    return () => {
      window.removeEventListener("resize", setHeaderHeightCustomProperties);
    };
  }, []);

  return (
    <html
      lang={request.locale?.isoCode || "en"}
      className={request.designMode ? "shopify-design-mode" : undefined}
    >
      <head>
        {settings.favicon && (
          <link rel="icon" type="image/png" href={settings.favicon} />
        )}

        {(settings.transitionToMainProduct ||
          settings.pageTransitionEnabled) && (
          <link
            rel="expect"
            href="#MainContent"
            blocking="render"
            id="view-transition-render-blocker"
          />
        )}

        {metaTags}
        {stylesheets}
        {fonts}
        {scripts}
        {themeStyleVariables}
        {colorSchemes}

        {request.designMode && themeEditor}

        {headerContent}
      </head>

      <body
        className={`
          page-width-${settings.pageWidth || "default"}
          card-hover-effect-${settings.cardHoverEffect || "default"}
        `}
      >
        {skipToContentLink || (
          <a href="#MainContent" className="skip-to-content-link">
            Skip to content
          </a>
        )}

        <div id="header-group">{headerGroup}</div>

        <main
          id="MainContent"
          className="content-for-layout"
          role="main"
          data-page-transition-enabled={settings.pageTransitionEnabled}
          data-product-transition={settings.transitionToMainProduct}
          data-template={template}
        >
          {children}
        </main>

        <footer>{footerGroup}</footer>

        {searchModal}

        {(settings.quickAdd || settings.mobileQuickAdd) && quickAddModal}
      </body>
    </html>
  );
};

export default ThemeLayout;
