import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function AIBrowserPage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="AI Browser" />
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a URL or search query..."
              className="flex-1"
            />
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Browse
            </Button>
          </div>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Browser View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">AI Browser content will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
