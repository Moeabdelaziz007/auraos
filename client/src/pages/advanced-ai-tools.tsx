import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AdvancedAITools from "@/components/ai/advanced-ai-tools";

export default function AdvancedAIToolsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Advanced AI Tools" 
          subtitle="Powerful AI tools with MCP integration"
          actions={
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">MCP:</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-500">Connected</span>
            </div>
          }
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <AdvancedAITools />
          </div>
        </main>
      </div>
    </div>
  );
}
