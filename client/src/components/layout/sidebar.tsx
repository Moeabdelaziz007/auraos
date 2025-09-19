import { useLocation } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
  { name: 'Social Feed', href: '/social-feed', icon: 'fas fa-users', hasNotification: true },
  { name: 'Workflows', href: '/workflows', icon: 'fas fa-project-diagram' },
  { name: 'AI Agents', href: '/ai-agents', icon: 'fas fa-robot' },
  { name: 'Smart Learning', href: '/smart-learning', icon: 'fas fa-brain' },
  { name: 'AI Tools', href: '/advanced-ai-tools', icon: 'fas fa-tools' },
  { name: 'Telegram', href: '/telegram', icon: 'fab fa-telegram' },
  { name: 'Analytics', href: '/analytics', icon: 'fas fa-chart-bar' },
  { name: 'Settings', href: '/settings', icon: 'fas fa-cog' },
  { name: 'Debug', href: '/debug', icon: 'fas fa-bug' },
  { name: 'Workspace', href: '/workspace', icon: 'fas fa-star' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  
  const { data: userData } = useQuery({
    queryKey: ['userData', user?.uid],
    queryFn: () => user?.uid ? Promise.resolve({ displayName: user.displayName, email: user.email }) : null,
    enabled: !!user?.uid
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="w-64 glass-card border-r border-border/50 flex flex-col backdrop-blur-xl cyber-scrollbar">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-cyber-primary rounded-xl flex items-center justify-center neon-glow-lg animate-neon-pulse">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl neon-text animate-neon-flicker">AuraOS</span>
            <span className="text-xs text-muted-foreground font-mono">v2.0</span>
          </div>
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
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "gradient-cyber-primary text-white neon-glow-lg animate-neon-pulse"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:neon-glow-sm hover:border-primary/30 border border-transparent"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <i className={`${item.icon} w-5 transition-transform duration-300 group-hover:scale-110`}></i>
                    <span className="font-medium">{item.name}</span>
                    {item.hasNotification && (
                      <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-neon-pulse neon-glow-sm"></div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-cyber-scan"></div>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <Separator className="bg-border/30" />
      
      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-all duration-300 group">
          <Avatar className="w-10 h-10 border border-primary/30 neon-glow-sm group-hover:neon-glow-md transition-all duration-300">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-bold">
              {user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate neon-text" data-testid="text-user-name">
              {user?.displayName || user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            data-testid="button-sign-out"
            title="Sign Out"
            className="hover:bg-primary/20 hover:text-primary transition-all duration-300 neon-glow-sm hover:neon-glow-md"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
