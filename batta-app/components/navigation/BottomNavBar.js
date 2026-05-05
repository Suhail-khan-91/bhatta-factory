"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, PlusSquare, BarChart2, Wallet, Truck, MoreVertical } from "lucide-react";
import AdminSettings from "@/components/admin/AdminSettings";

const NAV_ITEMS = [
  {
    label: "Sales",
    href: "/sales",
    icon: Truck,
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: Wallet,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    label: "Master Entry",
    href: "/master-entry",
    icon: PlusSquare,
  },
  {
    label: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      {showAdmin && <AdminSettings onClose={() => setShowAdmin(false)} />}
      
      {/* 3-dot menu at top right */}
      {!showAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 bg-gray-800 rounded-full text-white shadow-lg border border-gray-700 active:scale-95 transition-all"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={() => { setShowAdmin(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          )}
        </div>
      )}

      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white border-t border-gray-100
          shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
          h-16
        "
      >
        <ul className="flex items-center justify-around h-full px-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="
                    flex flex-col items-center justify-center gap-1
                    h-full w-full
                    relative
                    group
                  "
                >
                  {/* Active indicator pill */}
                  {isActive && (
                    <span
                      className="
                        absolute top-0 left-1/2 -translate-x-1/2
                        w-8 h-[3px] rounded-b-full
                        bg-blue-600
                      "
                    />
                  )}

                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={`
                      transition-all duration-200
                      ${isActive
                        ? "text-blue-600 scale-110"
                        : "text-gray-400 group-hover:text-gray-600 group-hover:scale-105"
                      }
                    `}
                  />

                  <span
                    className={`
                      text-[10px] font-medium leading-none transition-colors duration-200
                      ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                    `}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
