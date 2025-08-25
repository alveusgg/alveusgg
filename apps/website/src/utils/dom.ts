/**
 * Finds which element is visible under the cursor.
 *
 * Stops on any button, input, link, or image element, or any element with a
 *  background, ignoring any transparent divs or similar elements.
 *
 * Uses the center of the target element if triggered by keyboard.
 *
 * @param e Mouse event containing cursor position
 * @returns Element if one is visible under the cursor, null otherwise
 */
export function visibleUnderCursor(e: MouseEvent) {
  let { clientX: x, clientY: y } = e;

  // If the click event was triggered by a keyboard (e.g. 'Enter')
  // Then use the center of the target element as the position of the click
  if (e.detail === 0 && e.target instanceof HTMLElement) {
    const box = e.target.getBoundingClientRect();
    x = box.left + box.width / 2;
    y = box.top + box.height / 2;
  }

  // Get all the elements under the click
  const elements = document.elementsFromPoint(x, y);

  for (const element of elements) {
    if (element === document.body) break;

    // If we hit an interactive element, or an image, we stop
    if (
      [
        HTMLButtonElement,
        HTMLInputElement,
        HTMLAnchorElement,
        HTMLImageElement,
      ].some((type) => element instanceof type)
    ) {
      return element;
    }

    // If we hit an element with a background, we stop
    const style = getComputedStyle(element);
    if (
      style.backgroundImage !== "none" ||
      (style.backgroundColor.replaceAll(" ", "") !== "rgba(0,0,0,0)" &&
        style.backgroundColor !== "transparent" &&
        style.backgroundColor !== "")
    ) {
      return element;
    }
  }

  return null;
}
