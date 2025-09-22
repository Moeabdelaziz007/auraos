import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AINotesPage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="AI Notes" />
      <main className="grid flex-1 gap-6 p-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Notes</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">Notes list will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Note Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[60vh] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">Select a note to start editing.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
