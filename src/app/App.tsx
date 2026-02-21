import { useEffect } from "react";
import { AppProvider, useApp } from "./context";
import { Dashboard } from "./components/dashboard";
import { SearchOverlay } from "./components/search-overlay";
import { AlertsPanel } from "./components/alerts-panel";

function AppInner() {
  const { setSearchOpen } = useApp();

  // Global keyboard shortcut: Cmd/Ctrl+K → search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  return (
    <>
      <Dashboard />
      <SearchOverlay />
      <AlertsPanel />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
