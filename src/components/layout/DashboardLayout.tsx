import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full relative">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 bg-[radial-gradient(at_40%_20%,hsl(200_98%_39%/0.1)_0px,transparent_50%),radial-gradient(at_80%_80%,hsl(180_100%_35%/0.1)_0px,transparent_50%)]" />
      </div>
      
      <Sidebar />
      
      <motion.main 
        className="flex-1 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.main>
    </div>
  );
}