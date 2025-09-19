import { Card, CardContent } from "@/components/ui/card";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-robot text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground">AuraOS</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Social Media Platform</p>
          </div>

          {/* Loading Animation */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Loading your workspace...</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Loading Steps */}
            <div className="text-left space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Initializing AI systems</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Loading social media integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Connecting to Firestore database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span>Preparing your dashboard</span>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Powered by advanced AI</p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <i className="fas fa-brain text-primary"></i>
                <span>Smart Agents</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-share-alt text-accent"></i>
                <span>Auto Posting</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-chart-line text-green-500"></i>
                <span>Analytics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
