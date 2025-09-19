import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TelegramIntegration from "@/components/telegram/telegram-integration";

export default function TelegramPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Telegram Integration" 
          subtitle="Manage your Telegram bot and send messages"
          actions={
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bot Status:</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          }
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-6xl mx-auto">
            <TelegramIntegration />
          </div>
        </main>
      </div>
    </div>
  );
}
