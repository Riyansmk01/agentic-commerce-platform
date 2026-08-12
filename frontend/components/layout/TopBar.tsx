import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User, Building2 } from "lucide-react";

import { Search } from "lucide-react";

export function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
      <div className="flex items-center gap-3">
        {user?.organizationSlug && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Building2 size={13} className="text-slate-500" />
            <span>{user.organizationSlug}</span>
          </div>
        )}

        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <Search size={14} className="text-slate-400" />
          <span>Search or run command...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-2xs h-9 px-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
              <span className="text-xs font-semibold">{user?.name ?? "User"}</span>
              {user?.provider === "google" && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">Google</span>
              )}
              <ChevronDown size={12} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white border border-slate-200 shadow-lg rounded-lg p-1">
            <DropdownMenuItem className="gap-2 text-slate-700 hover:text-slate-900 focus:bg-slate-50 cursor-pointer">
              <User size={14} className="text-slate-400" />
              <span className="text-xs font-mono">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-2 text-red-600 hover:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="text-xs font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
