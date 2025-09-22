                <i className="fas fa-robot text-white text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold neon-text">AuraOS</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Social Media Platform</p>
            </div>
import Header from "@/components/ui/Header";
            {/* Loading Animation */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon shadow-neon-md"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium neon-text">Loading your workspace...</p>
                <div className="w-full bg-carbon-700 rounded-full h-2">
                  <div className="bg-neon h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow-md animate-spin-slow">
              {/* Loading Steps */}
              <div className="text-left space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                  <span>Initializing AI systems</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                  <span>Loading social media integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Connecting to Firestore database</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-carbon-500 rounded-full"></div>
                  <span>Preparing your dashboard</span>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-2">
            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Powered by advanced AI</p>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <i className="fas fa-brain text-neon"></i>
                  <span>Smart Agents</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fas fa-share-alt text-accent"></i>
                  <span>Auto Posting</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fas fa-chart-line text-neon"></i>
                  <span>Analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
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
