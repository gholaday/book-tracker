"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  BookOpen,
  CheckCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { useRouter, usePathname } from "next/navigation";
import { useBookContext } from "@/contexts/BookContext";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toReadBooks, readingBooks, completedBooks } = useBookContext();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleNavigationClick = (tabId: string) => {
    // If we're not on the dashboard page, navigate to it with the tab
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
      // Set the active tab after a short delay to ensure the page has loaded
      setTimeout(() => {
        onTabChange(tabId);
      }, 100);
    } else {
      // If we're already on the dashboard, just change the tab
      onTabChange(tabId);
    }
  };

  const navigationItems = [
    {
      id: "search",
      label: "Search Books",
      icon: <Search className="w-5 h-5" />,
      badge: null,
    },
    {
      id: "to-read",
      label: "Want to Read",
      icon: <Calendar className="w-5 h-5" />,
      badge: toReadBooks.length,
    },
    {
      id: "reading",
      label: "Reading",
      icon: <BookOpen className="w-5 h-5" />,
      badge: readingBooks.length,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle className="w-5 h-5" />,
      badge: completedBooks.length,
    },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
      }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[65px]">
        <div className="flex items-center">
          <div
            className={`flex items-center cursor-pointer hover:opacity-80 transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 delay-150'}`}
            onClick={() => handleNavigationClick("search")}
          >
            <BookOpen className="h-6 w-6  mr-2 flex-shrink-0" />
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Book Tracker</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'
              }`}
            onClick={() => handleNavigationClick(item.id)}
          >
            <div className="flex items-center w-full">
              {item.icon}
              {!isCollapsed && (
                <>
                  <span className="ml-3 flex-1 text-left">{item.label}</span>
                  {item.badge !== null && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </Button>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'
            }`}
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
