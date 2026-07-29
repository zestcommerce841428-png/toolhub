/**
 * Site-wide toast notifications. A single aria-live region is created lazily
 * on first use and reused for every toast, so screen readers get one
 * predictable announcement region instead of one per tool.
 */

const TOAST_TIMEOUT_MS = 4000;
let container;

function ensureContainer() {
  if (container) return container;
  container = document.createElement("div");
  container.id = "toolhub-toast-region";
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "true");
  container.className =
    "pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto";
  document.body.appendChild(container);
  return container;
}

const VARIANT_CLASSES = {
  info: "border-border bg-surface-raised text-text",
  success: "border-success/30 bg-surface-raised text-success",
  danger: "border-danger/30 bg-surface-raised text-danger",
};

/**
 * Shows a toast message.
 * @param {string} message
 * @param {{ variant?: "info"|"success"|"danger", timeoutMs?: number }} [options]
 */
export function showToast(message, options = {}) {
  const { variant = "info", timeoutMs = TOAST_TIMEOUT_MS } = options;
  const region = ensureContainer();

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg
    transition duration-normal ease-standard translate-y-2 opacity-0
    ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.info}`;
  toast.textContent = message;
  region.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  const remove = () => {
    toast.classList.add("opacity-0");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.remove();
      },
      { once: true }
    );
  };

  const timerId = setTimeout(remove, timeoutMs);
  toast.addEventListener("click", () => {
    clearTimeout(timerId);
    remove();
  });

  return remove;
}
