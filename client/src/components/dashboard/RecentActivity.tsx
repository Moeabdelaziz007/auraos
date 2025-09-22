import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/social/post-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PostWithAuthor } from "@shared/schema";

export default function RecentActivity() {
  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold neon-text animate-neon-flicker">Recent Activity</h2>
        <div className="flex items-center gap-2">
          <Button variant="neon" size="sm" data-testid="filter-all">
            All
          </Button>
          <Button variant="cyber" size="sm" data-testid="filter-ai-generated">
            AI Generated
          </Button>
          <Button variant="outline" size="sm" data-testid="filter-manual">
            Manual
          </Button>
        </div>
      </div>

      {postsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
