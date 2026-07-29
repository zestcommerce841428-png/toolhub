import { parseUserAgent } from "./logic.js";

const input = document.getElementById("ua-input");
const browserEl = document.getElementById("ua-browser");
const osEl = document.getElementById("ua-os");
const deviceEl = document.getElementById("ua-device");

function render() {
  if (!input.value.trim()) {
    browserEl.textContent = "—";
    osEl.textContent = "—";
    deviceEl.textContent = "—";
    return;
  }
  const { browser, os, deviceType } = parseUserAgent(input.value);
  browserEl.textContent = browser.version ? `${browser.name} ${browser.version}` : browser.name;
  osEl.textContent = os.version ? `${os.name} ${os.version}` : os.name;
  deviceEl.textContent = deviceType[0].toUpperCase() + deviceType.slice(1);
}

input.addEventListener("input", render);

document.getElementById("ua-use-mine").addEventListener("click", () => {
  input.value = navigator.userAgent;
  render();
});

input.value = navigator.userAgent;
render();
