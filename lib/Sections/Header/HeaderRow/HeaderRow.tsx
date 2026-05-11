import React, { JSX, ReactNode, useMemo } from "react";

import "./styles.css";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type HeaderRowName = "top" | "bottom";

type HeaderColumn = "left" | "center" | "right";

type HeaderItemKey =
  | "first"
  | "logo"
  | "menu"
  | "localization"
  | "search"
  | "drawer_search"
  | "actions";

/**
 * Dynamic settings structure.
 *
 * Equivalent to Shopify Liquid:
 *
 * settings[`${item}_position`]
 * settings[`${item}_row`]
 */
export type HeaderRowSettings = Partial<
  Record<`${Exclude<HeaderItemKey, "first">}_position`, HeaderColumn>
> &
  Partial<Record<`${Exclude<HeaderItemKey, "first">}_row`, HeaderRowName>>;

/**
 * Slot-based component injection.
 *
 * These are equivalent to the captured HTML fragments
 * passed into the Liquid template.
 */
export interface HeaderRowSlots {
  first?: ReactNode;
  logo?: ReactNode;
  menu?: ReactNode;
  localization?: ReactNode;
  search?: ReactNode;
  drawer_search?: ReactNode;
  actions?: ReactNode;
}

export interface HeaderRowProps extends HeaderRowSlots {
  /**
   * Current row being rendered.
   *
   * Equivalent to:
   * row = 'top' | 'bottom'
   */
  row: HeaderRowName;

  /**
   * Comma-separated order string
   * OR array-based order.
   *
   * Examples:
   *
   * "logo,menu,search,actions"
   *
   * or
   *
   * ['logo', 'menu', 'search', 'actions']
   */
  order: string | HeaderItemKey[];

  /**
   * Layout configuration object.
   */
  settings: HeaderRowSettings;

  /**
   * Optional additional className.
   */
  className?: string;

  /**
   * Optional row container element.
   */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const COLUMNS: HeaderColumn[] = ["left", "center", "right"];

/**
 * =========================================================
 * UTILITIES
 * =========================================================
 */

/**
 * Normalizes incoming order prop.
 *
 * Liquid equivalent:
 *
 * assign order = order | split: ','
 */
function normalizeOrder(order: string | HeaderItemKey[]): HeaderItemKey[] {
  if (Array.isArray(order)) {
    return order;
  }

  return order
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as HeaderItemKey[];
}

/**
 * Creates dynamic settings keys.
 *
 * Liquid equivalent:
 *
 * assign column_key = item | append: '_position'
 * assign row_key = item | append: '_row'
 */
function createDynamicKeys(item: Exclude<HeaderItemKey, "first">) {
  return {
    columnKey: `${item}_position` as const,
    rowKey: `${item}_row` as const,
  };
}

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export const HeaderRow: React.FC<HeaderRowProps> = ({
  row,
  order,
  settings,
  className,
  as: Component = "div",
  first,
  logo,
  menu,
  localization,
  search,
  drawer_search,
  actions,
}) => {
  /**
   * =======================================================
   * SLOT REGISTRY
   * =======================================================
   *
   * Equivalent to the final Liquid case statement:
   *
   * {% case key %}
   *   {% when 'logo' %}
   *     {{ logo }}
   * {% endcase %}
   */
  const slots: Record<HeaderItemKey, ReactNode> = {
    first,
    logo,
    menu,
    localization,
    search,
    drawer_search,
    actions,
  };

  /**
   * =======================================================
   * NORMALIZED ORDER
   * =======================================================
   */
  const normalizedOrder = useMemo(() => normalizeOrder(order), [order]);

  /**
   * =======================================================
   * COLUMN ORCHESTRATION ENGINE
   * =======================================================
   *
   * This is the React equivalent of the Liquid grouping logic.
   *
   * Liquid equivalent:
   *
   * assign left = ''
   * assign center = ''
   * assign right = ''
   */
  const columnMap = useMemo(() => {
    const map: Record<HeaderColumn, HeaderItemKey[]> = {
      left: [],
      center: [],
      right: [],
    };

    /**
     * =====================================================
     * SPECIAL FIRST SLOT HANDLING
     * =====================================================
     *
     * Liquid equivalent:
     *
     * if first != blank
     *   assign left = 'first '
     * endif
     */
    if (first) {
      map.left.push("first");
    }

    /**
     * =====================================================
     * MAIN ITEM PROCESSING LOOP
     * =====================================================
     */
    normalizedOrder.forEach((item) => {
      /**
       * Skip the synthetic first slot.
       */
      if (item === "first") {
        return;
      }

      const { columnKey, rowKey } = createDynamicKeys(item);

      /**
       * ===================================================
       * DEFAULTS
       * ===================================================
       *
       * Liquid equivalent:
       *
       * default: 'top'
       * default: 'left'
       */
      const itemRow = settings[rowKey] ?? "top";

      let itemColumn = settings[columnKey] ?? "left";

      /**
       * ===================================================
       * FORCED ACTIONS OVERRIDE
       * ===================================================
       *
       * Liquid equivalent:
       *
       * when 'actions'
       *   assign item_column = 'right'
       */
      if (item === "actions") {
        itemColumn = "right";
      }

      /**
       * ===================================================
       * ROW FILTERING
       * ===================================================
       *
       * Only include items for the current row.
       */
      if (itemRow !== row) {
        return;
      }

      /**
       * ===================================================
       * COLUMN DISTRIBUTION
       * ===================================================
       */
      map[itemColumn].push(item);
    });

    return map;
  }, [first, normalizedOrder, row, settings]);

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */
  return (
    <Component
      className={["header__row", `header__row--${row}`, className]
        .filter(Boolean)
        .join(" ")}
      data-testid={`header-row-${row}`}
    >
      {COLUMNS.map((column) => {
        const items = columnMap[column];

        /**
         * =================================================
         * SKIP EMPTY COLUMNS
         * =================================================
         *
         * Liquid equivalent:
         *
         * if items_array.size > 0
         */
        if (!items.length) {
          return null;
        }

        return (
          <div
            key={column}
            className={["header__column", `header__column--${column}`].join(
              " ",
            )}
            data-testid={`header-${row}-${column}`}
          >
            {items.map((key) => {
              const content = slots[key];

              /**
               * =============================================
               * BLANK SAFETY CHECK
               * =============================================
               *
               * Liquid equivalent:
               *
               * unless key == blank
               */
              if (!content) {
                return null;
              }

              return <React.Fragment key={key}>{content}</React.Fragment>;
            })}
          </div>
        );
      })}
    </Component>
  );
};

/**
 * =========================================================
 * EXAMPLE USAGE
 * =========================================================
 */

export function ExampleHeader() {
  return (
    <HeaderRow
      row="top"
      order="logo,menu,search,actions"
      settings={{
        logo_position: "left",
        logo_row: "top",

        menu_position: "center",
        menu_row: "top",

        search_position: "right",
        search_row: "top",
      }}
      first={
        <button type="button" className="header__drawer-trigger">
          ☰
        </button>
      }
      logo={
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/" className="header__logo">
          Brand
        </a>
      }
      menu={
        <nav className="header__menu">
          <ul>
            <li>Home</li>
            <li>Shop</li>
            <li>About</li>
          </ul>
        </nav>
      }
      search={<input type="search" placeholder="Search" />}
      actions={
        <div className="header__actions">
          <button type="button">Cart</button>
          <button type="button">Account</button>
        </div>
      }
    />
  );
}
