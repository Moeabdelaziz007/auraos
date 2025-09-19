import { useLocation } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { User } from "@shared/schema";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
  { name: 'Social Feed', href: '/social-feed', icon: 'fas fa-users', hasNotification: true },
  { name: 'Workflows', href: '/workflows', icon: 'fas fa-project-diagram' },
  { name: 'AI Agents', href: '/ai-agents', icon: 'fas fa-robot' },
  { name: 'Analytics', href: '/analytics', icon: 'fas fa-chart-bar' },
  { name: 'Settings', href: '/settings', icon: 'fas fa-cog' },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <span className="font-bold text-xl text-foreground">AIFlow</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <i className={`${item.icon} w-5`}></i>
                    <span className="font-medium">{item.name}</span>
                    {item.hasNotification && (
                      <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" data-testid="notification-dot"></div>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <Separator />
      
      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || undefined} alt={user?.displayName} />
            <AvatarFallback>
              {user?.displayName?.split(' ').map(n => n[0]).join('') || 'SC'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
              {user?.displayName || 'Sarah Chen'}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              {user?.email || 'sarah@aiflow.com'}
            </p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-user-menu">
            <i className="fas fa-ellipsis-h"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
