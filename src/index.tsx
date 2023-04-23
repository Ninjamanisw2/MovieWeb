import "core-js/stable";
import { StrictMode, Suspense, lazy } from "react";
import { render } from "react-dom";
import { BrowserRouter, HashRouter } from "react-router-dom";
import type { ReactNode } from "react-router-dom/node_modules/@types/react/index";
import { registerSW } from "virtual:pwa-register";

import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import App from "@/setup/App";
import { conf } from "@/setup/config";

import "@/setup/ga";
import "@/setup/sentry";
import "@/setup/i18n";
import "@/setup/index.css";
import "@/backend";
import { initializeChromecast } from "./setup/chromecast";
import { initializeStores } from "./utils/storage";

// initialize
const key =
  (window as any)?.__CONFIG__?.VITE_KEY ?? import.meta.env.VITE_KEY ?? null;
if (key) {
  (window as any).initMW(conf().PROXY_URLS, key);
}
initializeChromecast();
registerSW({
  immediate: true,
});

const LazyLoadedApp = lazy(async () => {
  await initializeStores();
  return {
    default: App,
  };
});

function TheRouter(props: { children: ReactNode }) {
  const normalRouter = conf().NORMAL_ROUTER;

  if (normalRouter) return <BrowserRouter>{props.children}</BrowserRouter>;
  return <HashRouter>{props.children}</HashRouter>;
}

render(
  <StrictMode>
    <ErrorBoundary>
      <TheRouter>
        <Suspense fallback="">
          <LazyLoadedApp />
        </Suspense>
      </TheRouter>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
