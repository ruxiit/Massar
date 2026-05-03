
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  CloudArrowUp, 
  ShieldCheck, 
  CalendarCheck, 
  Archive, 
  LockKey, 
  Student,
  Gear,
  Sparkle,
  FilePdf,
  IdentificationBadge
} from "@phosphor-icons/react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export type NavItem = {
  name?: string;
  title?: string;
  href: string;
  icon: any;
};

const defaultLinks: NavItem[] = [
  {
    name: "لوحة التحكم",
    href: "/student",
    icon: SquaresFour,
  },
  {
    name: "إيداع المذكرة",
    href: "/student/upload",
    icon: CloudArrowUp,
  },
  {
    name: "فحص الاقتباس",
    href: "/student/plagiarism",
    icon: ShieldCheck,
  },
  {
    name: "لجنة التحكيم",
    href: "/student/jury",
    icon: IdentificationBadge,
  },
  {
    name: "جدولة المناقشة",
    href: "/student/schedule",
    icon: CalendarCheck,
  },
  {
    name: "المحضر النهائي",
    href: "/student/pv",
    icon: FilePdf,
  },
  {
    name: "الأرشيف الرقمي",
    href: "/student/archive",
    icon: Archive,
  },
];

type SidebarProps = {
  links?: NavItem[];
  portalName?: string;
};

export function Sidebar({ links, portalName }: SidebarProps = {}) {
  const pathname = usePathname();

  const displayLinks = links || defaultLinks;

  return (
    <aside className="w-[300px] bg-white flex flex-col h-full shadow-[10px_0_40px_rgba(0,0,0,0.02)] z-20 p-[40px_0] border-l border-slate-50 relative overflow-hidden" dir="rtl">
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#059669 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="flex items-center gap-4 text-3xl font-black text-dark-navy mb-[60px] px-10 relative">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
          <Student size={28} weight="fill" className="text-white" />
        </div>
        <span className="tracking-tighter">مسار</span>
      </div>

      <nav className="flex-1 flex flex-col gap-3 px-5 relative">
        {displayLinks.map((link) => {
          const isPortalRoot = link.href === "/student" || link.href === "/admin" || link.href === "/teacher";
          const isActive = isPortalRoot ? pathname === link.href : (pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href)));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "relative flex items-center gap-5 px-7 py-4.5 rounded-[22px] transition-all duration-500 font-bold text-[15px] group overflow-hidden",
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-primary"
              )}
            >
              {/* Ultra Premium Active Background with Wipe Animation */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0.8, originX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.95 }}
                    transition={{ duration: 0.35, ease: "circOut" }}
                    className="absolute inset-0 z-0 overflow-hidden"
                  >
                    {/* Base Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/[0.04] to-transparent" />
                    
                    {/* Animated Particles Background */}
                    <motion.div 
                      animate={{ 
                        backgroundPosition: ['0px 0px', '40px 40px'],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        backgroundPosition: { duration: 10, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute inset-[-40px] z-0"
                      style={{ 
                        backgroundImage: `
                          radial-gradient(circle at 10% 20%, #059669 1.5px, transparent 1.5px),
                          radial-gradient(circle at 40% 50%, #059669 1px, transparent 1px),
                          radial-gradient(circle at 70% 30%, #059669 2px, transparent 2px),
                          radial-gradient(circle at 90% 80%, #059669 1.5px, transparent 1.5px),
                          radial-gradient(circle at 20% 70%, #059669 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                      }} 
                    />

                    {/* Subtle Pulse Glow */}
                    <motion.div 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-[22px] border border-primary/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={clsx(
                "relative z-10 w-6 h-6 flex items-center justify-center transition-all duration-500",
                isActive ? "scale-125 text-primary" : "group-hover:scale-110"
              )}>
                <link.icon 
                  size={isActive ? 24 : 22} 
                  weight={isActive ? "fill" : "bold"} 
                />
              </div>

              <span className="relative z-10 tracking-tight">{link.name || link.title}</span>
              
              {isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute right-4 top-4 z-10"
                >
                  <Sparkle size={14} weight="fill" className="text-primary/40 animate-spin-slow" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-7 space-y-6 relative border-t border-slate-50 pt-8">
        <button className="flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 font-bold text-text-muted hover:bg-slate-50 hover:text-primary w-full text-sm group">
          <Gear size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-700" />
          <span>الإعدادات المتقدمة</span>
        </button>
      </div>
    </aside>
  );
}
