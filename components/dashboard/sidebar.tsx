"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Home, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) => pathname === path;
  return (
    <aside className="w-full">
      <div className="fixed left-0 top-0 hidden h-screen w-[250px] overflow-y-auto border-r bg-white shadow-md md:block">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">ProjectHub</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className={`flex items-center px-4 py-2 ${isActive("/dashboard") ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className={`flex items-center px-4 py-2 ${isActive("/dashboard/projects") ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Briefcase className="mr-3 h-5 w-5" />
            Projects
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center px-4 py-2 ${isActive("/dashboard/settings") ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <Button className="w-full" onClick={logout} variant={"secondary"}>
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
