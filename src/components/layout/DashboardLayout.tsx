import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full relative bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient - Light mode: soft neutral, Dark mode: deep slate */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300" />
        
        {/* Gradient orbs - more subtle in light mode */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-400/5 dark:bg-cyan-500/5 rounded-full blur-[100px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />
      </div>
      
      {/* Mobile menu button - glass style */}
      <button
        className="fixed top-6 left-6 z-40 lg:hidden p-3 rounded-2xl bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.15] text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.12] transition-all shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <motion.main 
        className="flex-1 overflow-auto w-full lg:w-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.main>
    </div>
  );
}