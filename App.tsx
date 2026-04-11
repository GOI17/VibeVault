import { registerRootComponent } from "expo";

import App from "./app/_layout";

function restoreGitHubPagesPath(): void {
  if (typeof window === "undefined") {
    return;
  }

  const { location } = window;

  if (!location.search.startsWith("?/")) {
    return;
  }

  const encodedPath = location.search
    .slice(2)
    .replace(/~and~/g, "&");

  const firstQuerySeparator = encodedPath.indexOf("&");
  const pathname =
    firstQuerySeparator === -1
      ? encodedPath
      : encodedPath.slice(0, firstQuerySeparator);
  const rawQuery =
    firstQuerySeparator === -1
      ? ""
      : encodedPath.slice(firstQuerySeparator + 1);
  const query = rawQuery ? `?${rawQuery}` : "";

  const normalizedPath = pathname.replace(/^\/+/, "");
  const isSafePath = /^[A-Za-z0-9._~/%-]*$/.test(normalizedPath) && !normalizedPath.includes("..");

  if (!isSafePath) {
    return;
  }

  const nextUrl = `${location.pathname.replace(/\/$/, "")}/${normalizedPath}${query}${location.hash}`;

  window.history.replaceState(null, "", nextUrl);
}

function applyWebZoomPolicy(): void {
  if (typeof document === "undefined") {
    return;
  }

  const viewportContent = "width=device-width, initial-scale=1, viewport-fit=cover";
  const existingViewportMeta = document.querySelector('meta[name="viewport"]');

  if (existingViewportMeta) {
    existingViewportMeta.setAttribute("content", viewportContent);
  } else {
    const viewportMeta = document.createElement("meta");
    viewportMeta.setAttribute("name", "viewport");
    viewportMeta.setAttribute("content", viewportContent);
    document.head.appendChild(viewportMeta);
  }

  document.documentElement.style.touchAction = "manipulation";

  const zoomPolicyStyleId = "vibevault-web-zoom-policy";
  if (!document.getElementById(zoomPolicyStyleId)) {
    const policyStyle = document.createElement("style");
    policyStyle.id = zoomPolicyStyleId;
    policyStyle.textContent = [
      "html, body { touch-action: manipulation; }",
      "input, textarea, select { font-size: 16px !important; }",
    ].join(" ");
    document.head.appendChild(policyStyle);
  }
}

applyWebZoomPolicy();
restoreGitHubPagesPath();

registerRootComponent(App);
