import ProfileDropdown from "@/components/dashboard/profile-dropdown";
import Sidebar from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-main dark:bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-250-auto">
        <Sidebar />
        <main className="min-h-screen bg-main dark:bg-gray-950">
          <header className="fixed left-0 top-0 z-30 ml-0 w-full border-b bg-background py-2 transition-a lg:ml-[250px] lg:w-[calc(100%-250px)]">
            <nav className="mx-auto max-w-7xl px-2 flex-center-between">
              <div className="gap-2 flex-align-center">
                <div>
                  <Link href="/dashboard">
                    <Image
                      src="/default-image.jpg"
                      alt="Logo"
                      className="mx-auto object-contain"
                      width={40}
                      height={40}
                    />
                  </Link>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">ProjectHub</h1>
              </div>
              {/* Profile dropdown */}
              <ProfileDropdown user={user} />
            </nav>
          </header>
          <div className="mx-auto min-h-[80vh] max-w-7xl px-2 pt-20 md:px-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
