
import React from 'react';
import OptimizedImage from '../components/OptimizedImage';
import { Card, CardContent } from '../components/ui/card';

const SocialFeedExample: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent>
            <OptimizedImage
              src={`https://source.unsplash.com/random/400x300?sig=${i}`}
              alt={`Social media image ${i}`}
              className="w-full h-48 object-cover rounded-md"
              placeholder={<div className="w-full h-48 bg-gray-200 animate-pulse" />}
            />
            <div className="p-4">
              <h3 className="font-semibold">Post Title</h3>
              <p className="text-sm text-gray-500">This is an example of a social media post with an optimized image.</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SocialFeedExample;
