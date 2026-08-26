import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aqua_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aqua_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-mist overflow-x-hidden">
      {/* Shared Stable Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 min-w-0 w-full flex-col overflow-x-hidden transition-all duration-300">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          title={title}
        />
        <main className="flex-1 min-w-0 w-full px-4 py-6 sm:px-8 sm:py-8 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
