import {
  Sun,
  Moon,
  LayoutGrid,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ImageIcon,
  CheckSquare,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useGallery } from "@/context/GalleryContext";
import type { ViewMode } from "@/types";

interface AppChromeProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  username?: string;
  onLogout?: () => void;
  tabs?: { id: string; label: string; icon: React.ReactNode }[];
}

export function AppChrome({
  activeTab,
  onTabChange,
  onToggleSidebar,
  sidebarOpen,
  sidebarCollapsed,
  onToggleCollapse,
  username,
  onLogout,
  tabs,
}: AppChromeProps) {
  const { isDark, toggle } = useTheme();
  const { viewMode, setViewMode, total, selectionMode, setSelectionMode } =
    useGallery();

  const defaultTabs = [
    {
      id: "generate",
      label: "Generate",
      icon: <span className="text-sm">✨</span>,
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: <span className="text-sm">🖼️</span>,
    },
    { id: "stats", label: "Stats", icon: <span className="text-sm">📊</span> },
  ];

  const navigationTabs = tabs || defaultTabs;

  const viewModes: {
    mode: ViewMode;
    icon: typeof LayoutGrid;
    label: string;
  }[] = [{ mode: "masonry", icon: LayoutGrid, label: "Masonry" }];

  return (
    <>
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 h-12 lg:h-10 flex items-center border-b border-surface-200 dark:border-surface-800 bg-surface-100/95 dark:bg-surface-900/95 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1 min-w-0 flex-1 pl-2 pr-1 h-full">
          {/* Sidebar toggle — mobile: hamburger, desktop: collapse */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10"
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1 sm:gap-2 ml-0.5 h-full">
            <div className="shrink-0 w-7 h-7 rounded-md bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-1 ring-white/20 dark:ring-surface-900/50">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-surface-800 dark:text-surface-100 truncate max-w-30 sm:max-w-35">
              Mimpi
            </span>
          </div>

          {/* Tab Navigation — desktop only */}
          <div className="hidden lg:flex items-center gap-0.5 ml-4 overflow-x-auto scrollbar-none snap-x snap-mandatory h-full">
            {navigationTabs.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors snap-start ${
                  activeTab === id
                    ? "bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-200/50 dark:hover:bg-surface-700/50"
                }`}
              >
                {icon}
                {label}
                {id === "gallery" && total > 0 && (
                  <span className="ml-0.5 text-[10px] font-bold tabular-nums bg-primary-500/10 text-primary-600 dark:text-primary-400 px-1 rounded">
                    {total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 pr-2 ml-auto lg:flex-1 lg:justify-end h-full">
          {activeTab === "gallery" && (
            <>
              {!selectionMode && (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="flex items-center gap-1 px-2 h-7 rounded-md text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                  aria-label="Pilih gambar"
                >
                  <CheckSquare size={14} />
                  <span className="hidden sm:inline">Pilih</span>
                </button>
              )}
              <div className="hidden lg:flex items-center gap-1 rounded-md bg-surface-200/80 dark:bg-surface-700/80 p-0.5 border border-surface-200 dark:border-surface-600">
                {viewModes.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                      viewMode === mode
                        ? "bg-white dark:bg-surface-600 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                    }`}
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-md text-surface-500 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {username && onLogout && (
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-surface-200 dark:border-surface-700">
              <span className="text-xs text-surface-500 dark:text-surface-400 hidden sm:inline">
                {username}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 rounded-md text-surface-500 dark:text-surface-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10"
                aria-label="Logout"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Bottom Navigation — mobile only ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-14 bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 overflow-hidden">
        {navigationTabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              activeTab === id
                ? "text-primary-600 dark:text-primary-400"
                : "text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300"
            }`}
          >
            <div className="relative">
              {icon}
              {id === "gallery" && total > 0 && (
                <span className="absolute -top-1.5 -right-2 text-[9px] font-bold tabular-nums bg-primary-500 text-white min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-0.5 leading-none">
                  {total > 99 ? "99+" : total}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium ${
                activeTab === id ? "opacity-100" : "opacity-70"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
