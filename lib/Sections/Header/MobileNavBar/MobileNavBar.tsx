import { MENU } from "../data";

/* ============================================================
   MOBILE NAV BAR — horizontally scrollable top-level links,
   shown under the header row on small screens.
   ============================================================ */
export function MobileNavBar() {
  return (
    <div className="header__mobile-nav">
      <div className="menu-list--mobile-scroll">
        <ul className="menu-list--mobile">
          {MENU.map((link) => (
            <li key={link.title}>
              <a href={link.url}>{link.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
