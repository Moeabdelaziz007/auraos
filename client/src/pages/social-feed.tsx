import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import PostCard from "@/components/social/post-card";
import CreatePostDialog from "@/components/social/create-post-dialog";
import ChatWidget from "@/components/chat/chat-widget";
import { Card } from "@/components/ui/card";
import type { PostWithAuthor } from "@shared/schema";

export default function SocialFeed() {
  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts'],
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Social Feed" 
          subtitle="Engage with your community and share content"
          actions={<CreatePostDialog />}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/6"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="h-48 bg-muted rounded"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts?.length ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <i className="fas fa-comments text-4xl text-muted-foreground"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No posts yet</h3>
                    <p className="text-muted-foreground">Be the first to share something with the community!</p>
                  </div>
                  <CreatePostDialog />
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
