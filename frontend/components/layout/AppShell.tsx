import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "../CommandPalette";
import { UniversalActivityDrawer } from "../UniversalActivityDrawer";
import { SecondaryNav } from "./SecondaryNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(open => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Micro page transition loading bar on route change
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 220);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {isNavigating && <div className="top-loader-bar" />}
      <TopBar onOpenCommandPalette={() => setCmdOpen(true)} />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] border-l border-slate-200 z-10 relative">
          <SecondaryNav />
          <main className="flex-1 overflow-auto p-8 bg-slate-50/50 transition-opacity duration-200" key={location.pathname}>
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-1 duration-200">
              {children}
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <UniversalActivityDrawer />
    </div>
  );
}
