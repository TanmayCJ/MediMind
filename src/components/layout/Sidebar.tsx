import { NavLink } from "react-router-dom";
import { Activity, LayoutDashboard, Upload, History, Settings, LogOut, X, Users, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { toast } from "sonner";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/patients", icon: Users, label: "Patients" },
    { to: "/upload", icon: Upload, label: "Upload Report" },
    { to: "/history", icon: History, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay with blur */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Pure Glass Design */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        lg:relative
        w-72 flex flex-col m-3 rounded-3xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        
        /* Pure Glassmorphism - Light/Dark adaptive */
        bg-white/70 dark:bg-white/[0.08]
        backdrop-blur-2xl
        border border-black/[0.08] dark:border-white/[0.15]
        shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      `}
      style={{
        height: 'calc(100vh - 24px)',
      }}
      >
        {/* Inner glow/shine at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/30 to-transparent rounded-t-3xl" />
        
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/50 dark:from-white/[0.08] to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo glass container */}
              <div className="relative p-2.5 rounded-2xl bg-black/[0.05] dark:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.15] backdrop-blur-xl shadow-lg">
                <Activity className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 dark:text-white/90 tracking-tight">
                  MediMind AI
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-white/40 font-medium">Diagnostic Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.1] text-slate-500 dark:text-white/50 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all"
                onClick={toggleTheme}
                title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              {onClose && (
                <button
                  className="lg:hidden p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.1] text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.1] to-transparent" />

        {/* Navigation */}
        <nav className="relative z-10 flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? "text-slate-800 dark:text-white"
                    : "text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active state - glass pill */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-black/[0.05] dark:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.15] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
                  )}
                  
                  {/* Hover state */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-200 ${!isActive ? 'group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.05]' : ''}`} />
                  
                  {/* Icon container */}
                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-sky-500/20 text-sky-500 dark:text-sky-400' 
                      : 'bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.08]'
                  }`}>
                    <item.icon className="h-[18px] w-[18px]" />
                  </div>
                  
                  <span className="relative font-medium text-sm">{item.label}</span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.1] to-transparent" />

        {/* Bottom Section */}
        <div className="relative z-10 p-3">
          {/* Info card - glass */}
          <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.1] mb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-600 dark:text-white/70 mb-0.5">Quick Tip</p>
                <p className="text-[11px] text-slate-400 dark:text-white/40 leading-relaxed">Upload reports to track patient health trends</p>
              </div>
            </div>
          </div>
          
          {/* Sign out button - glass */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:border-black/[0.08] dark:hover:border-white/[0.12] transition-all duration-200 group"
            onClick={handleSignOut}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-red-500/10 transition-all">
              <LogOut className="h-[18px] w-[18px] group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}