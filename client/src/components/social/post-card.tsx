import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import type { PostWithAuthor } from "@shared/schema";

interface PostCardProps {
  post: PostWithAuthor;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setLiked(true);
    },
  });

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md" data-testid={`post-card-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.identityIcon || undefined} alt={post.author.identityName} />
            <AvatarFallback>
              {post.author.identityName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground" data-testid={`text-author-${post.id}`}>
                {post.author.identityName}
              </h3>
              <span className="text-sm text-muted-foreground">@{post.author.username}</span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span className="text-sm text-muted-foreground" data-testid={`text-timestamp-${post.id}`}>
                {formatTimeAgo(post.createdAt || new Date())}
              </span>
              {post.isAiGenerated && (
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary" data-testid={`badge-ai-generated-${post.id}`}>
                  <i className="fas fa-robot mr-1"></i>
                  AI Enhanced
                </Badge>
              )}
            </div>
            
            <p className="text-foreground mb-4 whitespace-pre-wrap" data-testid={`text-content-${post.id}`}>
              {post.content}
            </p>
            
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="w-full h-48 object-cover rounded-lg mb-4"
                data-testid={`img-content-${post.id}`}
              />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm"
              className={`flex items-center gap-2 transition-colors ${
                liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              data-testid={`button-like-${post.id}`}
            >
              <i className={liked ? 'fas fa-heart' : 'far fa-heart'}></i>
              <span data-testid={`text-likes-${post.id}`}>
                {liked ? post.likes + 1 : post.likes}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              data-testid={`button-comment-${post.id}`}
            >
              <i className="fas fa-comment"></i>
              <span data-testid={`text-comments-${post.id}`}>{post.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
              data-testid={`button-share-${post.id}`}
            >
              <i className="fas fa-retweet"></i>
              <span data-testid={`text-shares-${post.id}`}>{post.shares}</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-testid={`button-bookmark-${post.id}`}
          >
            <i className="far fa-bookmark"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
