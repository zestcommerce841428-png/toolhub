/**
 * Wires the WCAG accessible-radiogroup keyboard pattern (roving tabindex,
 * arrow/Home/End navigation, click-to-select) onto a `role="radiogroup"`
 * container of `role="radio"` buttons — the same behavior word-counter's
 * tool family (case-converter) and bmi-calculator each hand-rolled inline
 * before there were enough call sites to justify sharing it. New tools
 * with a mode/unit toggle should use this instead of re-copying the
 * keyboard-handling block.
 *
 * @param {HTMLElement} group - the `role="radiogroup"` container
 * @param {(radio: HTMLElement) => void} onSelect - called after the DOM's
 *   aria-checked/tabindex/focus state updates, with the newly selected radio
 * @returns {{ select: (radio: HTMLElement, options?: { focus?: boolean }) => void }}
 */
export function initRadioGroup(group, onSelect) {
  const radios = [...group.querySelectorAll('[role="radio"]')];

  function select(nextRadio, { focus = false } = {}) {
    radios.forEach((radio) => {
      const isSelected = radio === nextRadio;
      radio.setAttribute("aria-checked", String(isSelected));
      radio.tabIndex = isSelected ? 0 : -1;
      radio.classList.toggle("btn-primary", isSelected);
      radio.classList.toggle("btn-secondary", !isSelected);
    });
    if (focus) nextRadio.focus();
    onSelect(nextRadio);
  }

  group.addEventListener("click", (event) => {
    const radio = event.target.closest('[role="radio"]');
    if (radio) select(radio);
  });

  group.addEventListener("keydown", (event) => {
    const currentIndex = radios.findIndex((radio) => radio.getAttribute("aria-checked") === "true");
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % radios.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + radios.length) % radios.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = radios.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    select(radios[nextIndex], { focus: true });
  });

  return { select };
}
