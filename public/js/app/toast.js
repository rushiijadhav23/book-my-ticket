import { escapeHtml } from "./utils.js";

export function createToaster(toastHost) {
  return function toast(message, type = "info") {
    const el = document.createElement("div");
    const colors =
      type === "success"
        ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
        : type === "error"
          ? "bg-rose-500/15 border-rose-400/40 text-rose-100"
          : "bg-slate-500/15 border-slate-400/40 text-slate-100";

    el.className = `max-w-sm w-[min(420px,90vw)] border ${colors} backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg`;
    el.innerHTML = `<div class="text-sm font-semibold">${escapeHtml(message)}</div>`;

    toastHost.appendChild(el);
    setTimeout(() => el.classList.add("opacity-0", "transition", "duration-300"), 2600);
    setTimeout(() => el.remove(), 3000);
  };
}

