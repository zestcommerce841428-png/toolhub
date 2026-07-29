import { timestampToDate, dateToTimestamp } from "./logic.js";

const tsInput = document.getElementById("ts-input");
const unitSelect = document.getElementById("ts-unit");
const errorBox = document.getElementById("ts-error");
const localEl = document.getElementById("ts-local");
const utcEl = document.getElementById("ts-utc");
const isoEl = document.getElementById("ts-iso");

function renderForward() {
  if (!tsInput.value) {
    errorBox.classList.add("hidden");
    [localEl, utcEl, isoEl].forEach((el) => (el.textContent = "—"));
    return;
  }
  const result = timestampToDate(Number(tsInput.value), unitSelect.value);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  errorBox.classList.add("hidden");
  localEl.textContent = result.local;
  utcEl.textContent = result.utc;
  isoEl.textContent = result.iso;
}

tsInput.addEventListener("input", renderForward);
unitSelect.addEventListener("change", renderForward);

document.getElementById("ts-now").addEventListener("click", () => {
  unitSelect.value = "seconds";
  tsInput.value = Math.floor(Date.now() / 1000);
  renderForward();
});

tsInput.value = Math.floor(Date.now() / 1000);
renderForward();

// --- Date -> timestamp ---
const dateInput = document.getElementById("ts-date-input");
const outSecondsEl = document.getElementById("ts-out-seconds");
const outMillisEl = document.getElementById("ts-out-millis");

function renderBackward() {
  if (!dateInput.value) {
    outSecondsEl.textContent = "—";
    outMillisEl.textContent = "—";
    return;
  }
  const result = dateToTimestamp(dateInput.value);
  outSecondsEl.textContent = result.ok ? String(result.unixSeconds) : "—";
  outMillisEl.textContent = result.ok ? String(result.unixMilliseconds) : "—";
}

dateInput.addEventListener("input", renderBackward);

{
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  dateInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
renderBackward();
