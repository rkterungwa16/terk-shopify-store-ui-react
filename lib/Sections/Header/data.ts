/* ============================================================
   DATA MODEL — same shape as the vanilla build's `MENU` array.
   Swap this for fetched/injected data in production; every
   consumer below only depends on this shape.
   ============================================================ */
export const MENU = [
  { title: "Home", url: "#" },
  {
    title: "Tools",
    url: "#",
    links: [
      {
        heading: "Hand Tools",
        items: [
          { title: "Chisels", url: "#" },
          { title: "Hand Planes", url: "#" },
          { title: "Mallets", url: "#" },
        ],
      },
      {
        heading: "Power Tools",
        items: [
          { title: "Routers", url: "#" },
          { title: "Table Saws", url: "#" },
          { title: "Sanders", url: "#" },
        ],
      },
    ],
  },
  {
    title: "Materials",
    url: "#",
    links: [
      {
        heading: "Hardwoods",
        items: [
          { title: "Walnut", url: "#" },
          { title: "White Oak", url: "#" },
          { title: "Maple", url: "#" },
        ],
      },
      {
        heading: "Hardware",
        items: [
          { title: "Hinges", url: "#" },
          { title: "Fasteners", url: "#" },
          { title: "Finishes", url: "#" },
        ],
      },
    ],
  },
  { title: "Guides", url: "#" },
  { title: "Journal", url: "#" },
  { title: "Workshops", url: "#" },
  { title: "About", url: "#" },
  { title: "Contact", url: "#" },
];
