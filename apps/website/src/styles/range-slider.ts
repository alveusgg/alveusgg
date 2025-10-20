import plugin from "tailwindcss/plugin";

const rangeSlider = plugin(({ addVariant, addComponents }) => {
  addVariant("slider-thumb", [
    "&::-webkit-slider-thumb",
    "&::-moz-range-thumb",
  ]);

  addComponents({
    ".range-slider": {
      "&::-webkit-slider-thumb": {
        width: "1.5rem",
        height: "1.5rem",
        appearance: "none",
        borderRadius: "0.375rem",
        backgroundColor: "var(--color-alveus-tan)",
        boxShadow: "var(--shadow-lg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "scale(1.1)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      },
      "&::-moz-range-thumb": {
        width: "1.5rem",
        height: "1.5rem",
        appearance: "none",
        borderRadius: "0.375rem",
        border: "0",
        backgroundColor: "var(--color-alveus-tan)",
        boxShadow: "var(--shadow-lg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "scale(1.1)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      },
    },
  });
});

export default rangeSlider;
