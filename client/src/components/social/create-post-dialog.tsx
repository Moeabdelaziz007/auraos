
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

const CreatePostDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost: { content: string }) => {
      return apiRequest('POST', '/api/posts', newPost);
    },
    onSuccess: () => {
      trackEvent('create_post_success', { post_length: content.length });
      toast({
        title: "Post Created!",
        description: "Your post has been successfully shared.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsOpen(false);
      setContent('');
    },
    onError: (error) => {
      trackEvent('create_post_error', { error: error.message });
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem creating your post. Please try again.",
      });
    },
  });

  const handleCreatePost = () => {
    if (content.trim()) {
      mutation.mutate({ content });
    } else {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Post content cannot be empty.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={mutation.isPending}
        />
        <Button onClick={handleCreatePost} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
