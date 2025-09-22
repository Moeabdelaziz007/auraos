import { Bot } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <Bot className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          Preparing your dashboard...
        </p>
        <p className="text-sm text-muted-foreground">
          Initializing AI agents and workflows.
        </p>
      </div>
    </div>
  );
}
