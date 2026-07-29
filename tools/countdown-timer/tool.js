import { computeRemaining, pad2 } from "./logic.js";

const targetInput = document.getElementById("countdown-target");
const errorBox = document.getElementById("countdown-error");
const statusEl = document.getElementById("countdown-status");
const daysEl = document.getElementById("countdown-days");
const hoursEl = document.getElementById("countdown-hours");
const minutesEl = document.getElementById("countdown-minutes");
const secondsEl = document.getElementById("countdown-seconds");

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Default to 24 hours from now so the tool shows something meaningful immediately.
targetInput.value = toDatetimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

function render() {
  const result = computeRemaining(targetInput.value, Date.now());
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    statusEl.textContent = "";
    [daysEl, hoursEl, minutesEl, secondsEl].forEach((el) => (el.textContent = "—"));
    return;
  }
  errorBox.classList.add("hidden");
  statusEl.textContent = result.isPast ? "Time since target:" : "Time remaining:";
  daysEl.textContent = String(result.days);
  hoursEl.textContent = pad2(result.hours);
  minutesEl.textContent = pad2(result.minutes);
  secondsEl.textContent = pad2(result.seconds);
}

targetInput.addEventListener("input", render);
setInterval(render, 1000);
render();
