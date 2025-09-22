import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SocialFeed() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Social Feed" subtitle="View and manage your social media content." />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Social feed content will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
