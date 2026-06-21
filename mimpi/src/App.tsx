import React, { useState, useEffect, useCallback } from "react";
import { AppChrome } from "@/components/AppChrome";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ImageGallery } from "@/components/ImageGallery";
import { Lightbox } from "@/components/Lightbox";
import { GenerateTab } from "@/components/GenerateTab";
import { StatsTab } from "@/components/StatsTab";
import { LoginPage } from "@/components/LoginPage";
import { SettingsPage } from "@/components/SettingsPage";
import { UserManagement } from "@/components/UserManagement";
import { useGallery } from "@/context/GalleryContext";
import { Providers } from "@/Providers";
import { ToastContainer } from "@/components/Toast";
import type { TabId } from "@/types";
import { Settings, Users } from "lucide-react";

type ExtendedTabId = TabId | "settings" | "users";

interface User {
  username: string;
  role: string;
}

function AppContent({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const { sidebarCollapsed, setSidebarCollapsed } = useGallery();

  // Only admin can see Users tab
  const showUsersTab = user.role === "admin";

  const tabs: { id: string; label: string; icon: React.ReactNode }[] = [
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
    ...(showUsersTab
      ? [
          {
            id: "users",
            label: "Users",
            icon: <span className="text-sm">👥</span>,
          },
        ]
      : []),
    {
      id: "settings",
      label: "Settings",
      icon: <span className="text-sm">⚙️</span>,
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-50 dark:bg-surface-950">
      <AppChrome
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        username={user.username}
        onLogout={onLogout}
        tabs={tabs}
      />
      <div className="flex flex-1 min-h-0">
        {!sidebarCollapsed && activeTab === "gallery" && (
          <FilterSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex flex-1 min-w-0 flex-col min-h-0 overflow-auto pb-14 lg:pb-0">
          {activeTab === "gallery" && <ImageGallery />}
          {activeTab === "generate" && <GenerateTab />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "settings" && (
            <SettingsPage
              username={user.username}
              onUsernameChange={(newUsername) => {
                // This will be handled by the parent component
              }}
            />
          )}
          {activeTab === "users" && showUsersTab && <UserManagement />}
        </main>
      </div>
      <Lightbox />
    </div>
  );
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verify")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser({ username: data.username, role: data.role || "user" });
        }
      })
      .catch((e) => console.warn("Verify auth failed:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = useCallback((username: string, role?: string) => {
    setUser({ username, role: role || "user" });
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="text-center">
          <span className="text-4xl">🌙</span>
          <p className="text-surface-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Providers>
      <AppContent user={user} onLogout={handleLogout} />
      <ToastContainer />
    </Providers>
  );
}
