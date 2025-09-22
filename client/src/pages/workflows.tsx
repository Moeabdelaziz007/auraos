import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Workflows() {
  return (
    <div className="flex h-full flex-col">
      <Header
        title="Workflows"
        subtitle="Automate your tasks with powerful, self-improving workflows."
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Create Workflow</Button>}
      />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Your saved workflows will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
