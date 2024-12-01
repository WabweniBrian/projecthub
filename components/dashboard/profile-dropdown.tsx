"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { SessionUser } from "@/types";
import { LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import Avatar from "../common/avatar";

interface ProfileDropdownProps {
  user: SessionUser;
}

const ProfileDropdown = ({ user }: ProfileDropdownProps) => {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="!outline-none">
        {user?.image ? (
          <Avatar size="small" src={user?.image} />
        ) : (
          <Avatar size="small" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="rounded-xl dark:border-gray-700 dark:bg-accent"
      >
        <DropdownMenuItem>
          <Link
            href={`/dashboard/account`}
            className="cursor-pointer gap-x-2 flex-align-center"
          >
            {user?.image ? <Avatar src={user?.image} /> : <Avatar />}
            <div>
              <h1 className="text-xl">{user?.name}</h1>
              <span className="opacity-80">{user?.email}</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem asChild className="dark:hover:bg-gray-900/50">
          <Link
            href={`/dashboard/profile`}
            className="mt-1 cursor-pointer gap-x-2 flex-align-center"
          >
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dark:hover:bg-gray-900/50">
          <Link
            href={`/dashboard/settings`}
            className="mt-1 cursor-pointer gap-x-2 flex-align-center"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem
          asChild
          className="dark:hover:bg-gray-900/50"
          onClick={() => logout()}
        >
          <div className="cursor-pointer gap-x-2 flex-align-center">
            <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
