import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Home,
  Users,
  GitFork,
  Bot,
  Puzzle,
  Book,
  GraduationCap,
  Brain,
  Sparkles,
  Send,
  BarChart,
  Settings,
  Bug,
  Star,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Sun,
  Moon,
  Compass,
  FileText as FileTextIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "AI Browser", href: "/ai-browser", icon: Compass },
  { name: "AI Notes", href: "/ai-notes", icon: FileTextIcon },
  { name: "Social Feed", href: "/social-feed", icon: Users },
  { name: "Workflows", href: "/workflows", icon: GitFork },
  { name: "AI Agents", href: "/ai-agents", icon: Bot },
  { name: "MCP Tools", href: "/mcp-tools", icon: Puzzle },
  { name: "Prompt Library", href: "/prompt-library", icon: Book },
  { name: "Learning", href: "/learning", icon: GraduationCap },
  { name: "Smart Learning", href: "/smart-learning", icon: Brain },
  { name: "AI Tools", href: "/advanced-ai-tools", icon: Sparkles },
  { name: "Telegram", href: "/telegram", icon: Send },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Debug", href: "/debug", icon: Bug },
  { name: "Workspace", href: "/workspace", icon: Star },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-card text-card-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
         <Link href="/dashboard">
            <a className="flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1
                className={cn(
                    "text-xl font-bold text-foreground transition-opacity duration-200",
                    isCollapsed ? "opacity-0" : "opacity-100"
                )}
                >
                AuraOS
                </h1>
            </a>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className={cn(isCollapsed ? "hidden" : "block")}>
                      {item.name}
                    </span>
                  </a>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t p-3">
        <div className="space-y-2">
            {/* Theme Toggle */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size={isCollapsed ? "icon" : "default"} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("w-full", isCollapsed ? "" : "justify-start gap-3")}>
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span className={cn(isCollapsed ? "hidden" : "block")}>Toggle Theme</span>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right"><p>Toggle Theme</p></TooltipContent>}
            </Tooltip>

            {/* Collapse Toggle */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size={isCollapsed ? "icon" : "default"} onClick={toggleSidebar} className={cn("w-full", isCollapsed ? "" : "justify-start gap-3")}>
                        {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                        <span className={cn(isCollapsed ? "hidden" : "block")}>Collapse</span>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right"><p>Collapse</p></TooltipContent>}
            </Tooltip>
        </div>

        {/* User Profile */}
        <div className="mt-4 flex items-center gap-3 rounded-md p-2 hover:bg-muted/50">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className={cn("flex-1 min-w-0", isCollapsed && "hidden")}>
            <p className="truncate text-sm font-medium text-foreground">
              {user?.displayName || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          {!isCollapsed && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={signOut}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Sign Out</p></TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
