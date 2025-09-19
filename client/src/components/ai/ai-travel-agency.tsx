
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

const AITravelAgency: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Travel Agency</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Welcome to the AI Travel Agency. Let our AI-powered agents help you plan your next trip.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {
            // Add AI travel agent cards here
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default AITravelAgency;
