import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
          </Button>
          {actions}
        </div>
      </div>
    </header>
  );
}
