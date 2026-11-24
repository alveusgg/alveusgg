// Each colour styles the parts of the nav: the top-level pills (main), the
// dropdown panels, the links inside them (sub), and the icon and description
// of links that have them
export const navColors = {
  green: {
    main: "inset-ring-white/20 hover:bg-black/30 hover:inset-ring",
    sub: "hover:bg-alveus-green-800 data-focus:bg-alveus-green-800",
    icon: "bg-alveus-green-800 group-hover/link:bg-alveus-green-900 group-data-focus/link:bg-alveus-green-900",
    description: "text-alveus-green-200",
    active: {
      main: "bg-black/30 inset-ring",
      sub: "bg-alveus-green-800",
      icon: "bg-alveus-green-900",
    },
    panel: "border-black/20 bg-alveus-green-900",
  },
  tan: {
    main: "bg-alveus-tan-100 font-bold text-alveus-green-800 inset-ring inset-ring-alveus-tan-150 hover:bg-alveus-tan-150",
    sub: "hover:bg-alveus-tan-150 data-focus:bg-alveus-tan-150",
    icon: "bg-alveus-tan-150 group-hover/link:bg-alveus-tan-100 group-data-focus/link:bg-alveus-tan-100",
    description: "text-alveus-green-700",
    active: {
      main: "bg-alveus-tan-150",
      sub: "bg-alveus-tan-150",
      icon: "bg-alveus-tan-100",
    },
    panel: "border-alveus-tan-150 bg-alveus-tan-100 text-alveus-green-900",
  },
};

export type NavColor = keyof typeof navColors;
