// Example Component: Social Feed with Firestore Integration

import React, { useState } from 'react';
import { useAuth, usePosts, usePostsRealtime } from '../hooks/use-firestore';
import { Post } from '../lib/firestore-types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Heart, MessageCircle, Share, Plus, Search } from 'lucide-react';

export function SocialFeedExample() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { posts, loading, error, createPost, likePost, unlikePost } = usePosts();
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) return;

    try {
      setIsCreating(true);
      await createPost(user.uid, {
        title: newPost.title,
        content: newPost.content,
        visibility: 'public',
        tags: []
      });
      setNewPost({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await unlikePost(postId, user.uid);
      } else {
        await likePost(postId, user.uid);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to AuraOS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sign in with Google to access your social feed and AI-powered features.
            </p>
            <Button onClick={signInWithGoogle} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Feed</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.displayName}!
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Post title (optional)"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.content.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading posts: {error}</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No posts yet. Create the first one above!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: Post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user.uid}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string, isLiked: boolean) => void;
}

function PostCard({ post, currentUserId, onLike }: PostCardProps) {
  const isLiked = post.likedBy?.includes(currentUserId) || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {post.userId.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">User {post.userId.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">
                {post.createdAt?.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {post.visibility}
          </Badge>
        </div>
        {post.title && (
          <CardTitle className="text-lg">{post.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{post.content}</p>
        
        {/* Post Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id, isLiked)}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes}
          </Button>
          
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-1" />
            {post.shares}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example: Real-time Posts Component
export function RealtimePostsExample({ userId }: { userId: string }) {
  const { posts, loading, error } = usePostsRealtime(userId);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading real-time posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Real-time Posts ({posts.length})</h3>
      {posts.map((post: Post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            <p className="font-semibold">{post.title || 'Untitled'}</p>
            <p className="text-muted-foreground">{post.content}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>📤 {post.shares}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
