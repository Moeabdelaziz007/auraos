import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl?: string; isAiGenerated: boolean }) => {
      return apiRequest('POST', '/api/posts', {
        ...data,
        authorId: 'user-1', // Default user for demo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setOpen(false);
      setContent("");
      setImageUrl("");
      setAiPrompt("");
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/generate-content', {
        prompt,
        type: 'post'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.content);
      setIsGenerating(false);
      toast({
        title: "Content generated!",
        description: "AI has generated content for your post.",
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateContent = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for AI generation.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateContentMutation.mutate(aiPrompt);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content,
      imageUrl: imageUrl || undefined,
      isAiGenerated: !!aiPrompt,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-post">
          <i className="fas fa-plus mr-2"></i>
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-create-post">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* AI Content Generation */}
          <div className="space-y-3">
            <Label>AI Content Generation (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Describe what you want to post about..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                data-testid="input-ai-prompt"
              />
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating}
                data-testid="button-generate-content"
              >
                <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'} mr-2`}></i>
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Post Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="content">Post Content</Label>
              {aiPrompt && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <i className="fas fa-robot mr-1"></i>
                  AI Generated
                </Badge>
              )}
            </div>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              data-testid="textarea-content"
            />
            <div className="text-sm text-muted-foreground text-right">
              {content.length}/500 characters
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-3">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              data-testid="input-image-url"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-2">
              <Label>Image Preview</Label>
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-lg border"
                onError={() => {
                  toast({
                    title: "Invalid image URL",
                    description: "The image URL is not valid or accessible.",
                    variant: "destructive",
                  });
                }}
                data-testid="img-preview"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createPostMutation.isPending}
              data-testid="button-post"
            >
              <i className={`fas ${createPostMutation.isPending ? 'fa-spinner fa-spin' : 'fa-share'} mr-2`}></i>
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
