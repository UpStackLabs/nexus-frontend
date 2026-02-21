import { createContext, useContext, useState, type ReactNode } from "react";

export type NavTab = "DASHBOARD" | "GLOBE" | "INTEL" | "MARKETS";

interface AppState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  alertsOpen: boolean;
  setAlertsOpen: (v: boolean) => void;
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>("DASHBOARD");
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      searchOpen, setSearchOpen,
      alertsOpen, setAlertsOpen,
      selectedSymbol, setSelectedSymbol,
      selectedEventId, setSelectedEventId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
