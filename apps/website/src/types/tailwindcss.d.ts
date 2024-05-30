declare module "tailwindcss/lib/util/flattenColorPalette" {
  const flattenColorPalette: (
    obj: Record<string, Record<string, string | Record<string, string>>>,
  ) => Record<string, string>;
  export default flattenColorPalette;
}
