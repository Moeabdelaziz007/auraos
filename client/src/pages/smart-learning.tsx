import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SmartLearningAI from "@/components/ai/smart-learning-ai";

export default function SmartLearningPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Smart Learning AI" 
          subtitle="Zero-shot learning with meta-loop adaptation"
          actions={
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Meta-Learning:</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-500">Active</span>
            </div>
          }
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <SmartLearningAI />
          </div>
        </main>
      </div>
    </div>
  );
}
