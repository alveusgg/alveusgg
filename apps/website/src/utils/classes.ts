export function classes(
  ...classes: Array<string | boolean | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}
