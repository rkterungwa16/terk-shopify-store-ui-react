import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";

type MenuStyle =
  | "default"
  | "collection_images"
  | "featured_collections"
  | "featured_products";

interface FeaturedImage {
  src: string;
  alt?: string;
}

interface Product {
  id: string;
  title: string;
  url: string;
  image?: FeaturedImage;
}

interface Collection {
  id: string;
  title: string;
  url: string;
  image?: FeaturedImage;
  products?: Product[];
}

interface MenuLink {
  id: string;
  title: string;
  url: string;
  handle?: string;
  current?: boolean;
  childActive?: boolean;
  type?: "link" | "collection_link" | "collections_link" | "catalog_link";
  image?: FeaturedImage;
  object?: Collection;
  links?: MenuLink[];
}

interface LocalizationConfig {
  showLanguage?: boolean;
  showCountry?: boolean;
  languageCode?: string;
  countryCode?: string;
  currencyCode?: string;
  countryFlagUrl?: string;
}

interface HeaderDrawerSettings {
  colorScheme?: string;
  drawerAccordion?: boolean;
  drawerAccordionExpandFirst?: boolean;
  drawerDividers?: boolean;
  imageBorderRadius?: number;
  menuStyle?: MenuStyle;
  featuredCollectionsAspectRatio?: string;
  featuredProductsAspectRatio?: string;
}

interface HeaderDrawerProps {
  links: MenuLink[];
  className?: string;
  dataHeaderDrawerType?: string;
  settings?: HeaderDrawerSettings;
  localization?: LocalizationConfig;
}

const DEFAULT_SETTINGS: Required<HeaderDrawerSettings> = {
  colorScheme: "background-1",
  drawerAccordion: true,
  drawerAccordionExpandFirst: true,
  drawerDividers: false,
  imageBorderRadius: 12,
  menuStyle: "default",
  featuredCollectionsAspectRatio: "1 / 1",
  featuredProductsAspectRatio: "1 / 1",
};

const MAX_FEATURED_ITEMS = 4;

function hasChildren(link: MenuLink): boolean {
  return Boolean(link.links?.length);
}

function getLevels(links: MenuLink[]): number {
  const traverse = (items: MenuLink[], depth = 1): number => {
    return Math.max(
      depth,
      ...items.map((item) =>
        item.links?.length ? traverse(item.links, depth + 1) : depth,
      ),
    );
  };

  return traverse(links);
}

function shouldRenderLinkImage(
  links: MenuLink[] = [],
  menuStyle: MenuStyle,
): boolean {
  if (menuStyle !== "collection_images") {
    return false;
  }

  return links.some((link) =>
    ["catalog_link", "collections_link", "collection_link"].includes(
      link.type || "",
    ),
  );
}

function MenuImage({
  image,
  className,
}: {
  image?: FeaturedImage;
  className?: string;
}) {
  if (!image) return null;

  return (
    <img
      src={image.src}
      alt={image.alt || ""}
      className={className}
      loading="lazy"
    />
  );
}

function FeaturedCard({
  title,
  url,
  image,
}: {
  title: string;
  url: string;
  image?: FeaturedImage;
}) {
  return (
    <a className="resource-card" href={url}>
      <div className="resource-card__image-wrapper">
        <MenuImage image={image} className="resource-card__image" />
      </div>

      <div className="resource-card__content">
        <span>{title}</span>
      </div>
    </a>
  );
}

function Accordion({
  title,
  defaultOpen,
  className,
  children,
}: React.PropsWithChildren<{
  title: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}>) {
  return (
    <details open={defaultOpen} className={className}>
      <summary className="menu-drawer__summary">
        {title}

        <span className="menu-drawer__icon">+</span>
      </summary>

      <div className="details-content">{children}</div>
    </details>
  );
}

function ChildLinkList({
  links,
  renderImages,
  className,
}: {
  links: MenuLink[];
  renderImages: boolean;
  className?: string;
}) {
  return (
    <ul
      className={`menu-drawer__menu ${className || ""} ${
        renderImages ? "menu-drawer__menu--grid" : ""
      }`}
      role="list"
    >
      {links.map((link, index) => (
        <li
          key={link.id}
          className="menu-drawer__list-item"
          style={
            {
              "--menu-drawer-animation-index": index + 1,
            } as React.CSSProperties
          }
        >
          <a
            href={link.url}
            className={`menu-drawer__menu-item menu-drawer__menu-item--child ${
              link.current ? "menu-drawer__menu-item--active" : ""
            }`}
            aria-current={link.current ? "page" : undefined}
          >
            {renderImages && (
              <MenuImage
                image={link.image}
                className="menu-drawer__link-image"
              />
            )}

            <span className="menu-drawer__menu-item-text">{link.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function HeaderDrawer({
  links,
  className,
  dataHeaderDrawerType,
  settings: incomingSettings,
  localization,
}: HeaderDrawerProps) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...incomingSettings,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement | null>(null);

  const levels = useMemo(() => getLevels(links), [links]);

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const openSubmenu = (id: string) => {
    setActiveSubmenu(id);
  };

  const goBack = () => {
    setActiveSubmenu(null);
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  const featuredCollections = useMemo(() => {
    if (settings.menuStyle !== "featured_collections") {
      return [];
    }

    return links
      .filter((link) => link.type === "collection_link")
      .slice(0, MAX_FEATURED_ITEMS);
  }, [links, settings.menuStyle]);

  const featuredProducts = useMemo(() => {
    if (settings.menuStyle !== "featured_products") {
      return [];
    }

    const collectionLink = links.find(
      (link) => link.type === "collection_link",
    );

    return collectionLink?.object?.products?.slice(0, MAX_FEATURED_ITEMS) || [];
  }, [links, settings.menuStyle]);

  return (
    <div
      className={`header-drawer ${className || ""}`}
      style={
        {
          "--menu-image-border-radius": `${settings.imageBorderRadius}px`,
          "--resource-card-corner-radius": `${settings.imageBorderRadius}px`,
        } as React.CSSProperties
      }
    >
      <button
        className="header__icon header__icon--menu header__icon--summary"
        aria-label="Open menu"
        onClick={toggleDrawer}
      >
        <span className="header-drawer-icon">{isOpen ? "✕" : "☰"}</span>
      </button>

      <div
        ref={drawerRef}
        className={[
          "menu-drawer",
          `color-${settings.colorScheme}`,
          isOpen ? "menu-open" : "",
          activeSubmenu ? "menu-drawer--has-submenu-opened" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          className="button close-button menu-drawer__close-button"
          aria-label="Close menu"
          onClick={closeDrawer}
        >
          ✕
        </button>

        <nav className="menu-drawer__navigation" aria-label="Header navigation">
          <ul className="menu-drawer__menu has-submenu" role="list">
            {levels < 3
              ? links.map((link, index) => {
                  const renderImages = shouldRenderLinkImage(
                    link.links,
                    settings.menuStyle,
                  );

                  const itemClass = settings.drawerAccordion
                    ? "menu-drawer__list-item--deep"
                    : "menu-drawer__list-item--flat";

                  return (
                    <li
                      key={link.id}
                      className={`${itemClass} ${
                        settings.drawerDividers
                          ? "menu-drawer__list-item--divider"
                          : ""
                      }`}
                      style={
                        {
                          "--menu-drawer-animation-index": index + 1,
                        } as React.CSSProperties
                      }
                    >
                      {hasChildren(link) ? (
                        settings.drawerAccordion ? (
                          <Accordion
                            defaultOpen={
                              settings.drawerAccordionExpandFirst && index === 0
                            }
                            title={
                              <span className="menu-drawer__menu-item menu-drawer__menu-item--mainlist">
                                {link.title}
                              </span>
                            }
                          >
                            <ChildLinkList
                              links={link.links || []}
                              renderImages={renderImages}
                              className="menu-drawer__menu--childlist"
                            />
                          </Accordion>
                        ) : (
                          <Fragment>
                            <a
                              href={link.url}
                              className="menu-drawer__menu-item menu-drawer__menu-item--mainlist"
                            >
                              {link.title}
                            </a>

                            <ChildLinkList
                              links={link.links || []}
                              renderImages={renderImages}
                              className="menu-drawer__menu--childlist"
                            />
                          </Fragment>
                        )
                      ) : (
                        <a
                          href={link.url}
                          className="menu-drawer__menu-item menu-drawer__menu-item--mainlist"
                          aria-current={link.current ? "page" : undefined}
                        >
                          <span className="menu-drawer__menu-item-text">
                            {link.title}
                          </span>
                        </a>
                      )}
                    </li>
                  );
                })
              : links.map((link, index) => {
                  const submenuId = `submenu-${link.id}`;

                  return (
                    <li
                      key={link.id}
                      className="menu-drawer__list-item"
                      style={
                        {
                          "--menu-drawer-animation-index": index + 1,
                        } as React.CSSProperties
                      }
                    >
                      {hasChildren(link) ? (
                        <Fragment>
                          <button
                            className={`menu-drawer__menu-item menu-drawer__menu-item--mainlist ${
                              link.childActive
                                ? "menu-drawer__menu-item--active"
                                : ""
                            }`}
                            onClick={() => openSubmenu(submenuId)}
                          >
                            <span>{link.title}</span>

                            <span>›</span>
                          </button>

                          <div
                            className={`menu-drawer__submenu ${
                              activeSubmenu === submenuId ? "menu-open" : ""
                            }`}
                          >
                            <div className="menu-drawer__inner-submenu">
                              <div className="menu-drawer__nav-buttons">
                                <button
                                  className="menu-drawer__back-button"
                                  onClick={goBack}
                                >
                                  ‹ {link.title}
                                </button>

                                <button
                                  className="menu-drawer__close-button"
                                  onClick={closeDrawer}
                                >
                                  ✕
                                </button>
                              </div>

                              <ul
                                className="menu-drawer__menu menu-drawer__menu--childlist"
                                role="list"
                              >
                                {link.links?.map((child, childIndex) => {
                                  const renderImages = shouldRenderLinkImage(
                                    child.links,
                                    settings.menuStyle,
                                  );

                                  const hasGrandchildren = hasChildren(child);

                                  return (
                                    <li
                                      key={child.id}
                                      className={`menu-drawer__list-item ${
                                        settings.drawerDividers
                                          ? "menu-drawer__list-item--divider"
                                          : ""
                                      }`}
                                    >
                                      {!hasGrandchildren ? (
                                        <a
                                          href={child.url}
                                          className="menu-drawer__menu-item menu-drawer__menu-item--parent"
                                        >
                                          {renderImages && (
                                            <MenuImage
                                              image={child.image}
                                              className="menu-drawer__link-image"
                                            />
                                          )}

                                          <span>{child.title}</span>
                                        </a>
                                      ) : settings.drawerAccordion ? (
                                        <Accordion
                                          defaultOpen={
                                            settings.drawerAccordionExpandFirst &&
                                            childIndex === 0
                                          }
                                          title={
                                            <span className="menu-drawer__menu-item menu-drawer__menu-item--parent">
                                              {child.title}
                                            </span>
                                          }
                                        >
                                          <ChildLinkList
                                            links={child.links || []}
                                            renderImages={renderImages}
                                            className="menu-drawer__menu--grandchildlist"
                                          />
                                        </Accordion>
                                      ) : (
                                        <Fragment>
                                          <a
                                            href={child.url}
                                            className="menu-drawer__menu-item menu-drawer__menu-item--parent"
                                          >
                                            {child.title}
                                          </a>

                                          <ChildLinkList
                                            links={child.links || []}
                                            renderImages={renderImages}
                                            className="menu-drawer__menu--grandchildlist"
                                          />
                                        </Fragment>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </Fragment>
                      ) : (
                        <a
                          href={link.url}
                          className="menu-drawer__menu-item menu-drawer__menu-item--mainlist"
                        >
                          {link.title}
                        </a>
                      )}
                    </li>
                  );
                })}
          </ul>
        </nav>

        {dataHeaderDrawerType === "mobile-drawer" &&
          (localization?.showCountry || localization?.showLanguage) && (
            <div className="menu-drawer__utility-links">
              <div className="menu-drawer__localization">
                <button className="drawer-localization__button">
                  <div className="drawer-localization__button--label">
                    {localization.showCountry && (
                      <div className="mobile-localization">
                        {localization.countryFlagUrl && (
                          <span className="icon-flag">
                            <img
                              src={localization.countryFlagUrl}
                              alt={localization.countryCode}
                            />
                          </span>
                        )}

                        <span className="currency-code">
                          {localization.currencyCode}
                        </span>
                      </div>
                    )}

                    {localization.showCountry && localization.showLanguage && (
                      <span>/</span>
                    )}

                    {localization.showLanguage && (
                      <div className="mobile-localization">
                        <span>{localization.languageCode?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <span>›</span>
                </button>
              </div>
            </div>
          )}

        {(featuredCollections.length > 0 || featuredProducts.length > 0) && (
          <div className="menu-drawer__featured-content">
            <ul className="menu-drawer__featured-content-list">
              {featuredCollections.map((collection) => (
                <li
                  key={collection.id}
                  className="menu-drawer__featured-content-list-item menu-drawer__featured-content-list-item--collection"
                >
                  <FeaturedCard
                    title={collection.title}
                    url={collection.url}
                    image={collection.image}
                  />
                </li>
              ))}

              {featuredProducts.map((product) => (
                <li
                  key={product.id}
                  className="menu-drawer__featured-content-list-item menu-drawer__featured-content-list-item--product"
                >
                  <FeaturedCard
                    title={product.title}
                    url={product.url}
                    image={product.image}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="menu-drawer__backdrop" onClick={closeDrawer} />
      )}
    </div>
  );
}
