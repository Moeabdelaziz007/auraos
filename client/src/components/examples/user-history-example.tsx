// Example component demonstrating user history tracking usage
// This shows how to integrate tracking into your components

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useUserHistory, useInteractionTracking, useFormTracking } from '../../hooks/use-user-history';

export function UserHistoryExample() {
  const { 
    trackNavigation, 
    trackContentInteraction, 
    trackAIInteraction,
    trackError 
  } = useUserHistory();

  const { 
    trackClick, 
    trackView, 
    trackCreate, 
    trackUpdate, 
    trackDelete 
  } = useInteractionTracking('example-component');

  const { 
    trackFormStart, 
    trackFieldFocus, 
    trackFormSubmit, 
    trackFormAbandon 
  } = useFormTracking('example-form');

  const handleExampleClick = () => {
    trackClick('example-button', { 
      component: 'UserHistoryExample',
      action: 'demo_click' 
    });
  };

  const handleAIDemo = () => {
    trackAIInteraction('chat', 'demo-agent', {
      message: 'Hello AI!',
      context: 'demo'
    });
  };

  const handleErrorDemo = () => {
    try {
      throw new Error('This is a demo error');
    } catch (error) {
      trackError(error as Error, 'demo-error', {
        component: 'UserHistoryExample'
      });
    }
  };

  const handleFormDemo = () => {
    trackFormStart();
    trackFieldFocus('demo-field');
    trackFormSubmit(true, { 
      field1: 'demo value',
      field2: 'another value' 
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User History Tracking Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          This component demonstrates how to use the user history tracking system.
          Click the buttons below to see different types of tracking in action.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleExampleClick}
            className="w-full"
          >
            Track Click
          </Button>

          <Button 
            onClick={handleAIDemo}
            variant="secondary"
            className="w-full"
          >
            Track AI Interaction
          </Button>

          <Button 
            onClick={handleErrorDemo}
            variant="destructive"
            className="w-full"
          >
            Track Error
          </Button>

          <Button 
            onClick={handleFormDemo}
            variant="outline"
            className="w-full"
          >
            Track Form
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">What gets tracked:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Page navigation and time spent</li>
            <li>• Button clicks and user interactions</li>
            <li>• Form interactions and submissions</li>
            <li>• AI agent interactions</li>
            <li>• Errors and system events</li>
            <li>• Device and browser information</li>
            <li>• Session duration and activity</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-900">How to use in your components:</h4>
          <pre className="text-xs text-blue-800 overflow-x-auto">
{`import { useUserHistory, useInteractionTracking } from '@/hooks/use-user-history';

function MyComponent() {
  const { trackContentInteraction } = useUserHistory();
  const { trackClick } = useInteractionTracking('my-component');

  const handleClick = () => {
    trackClick('my-button', { action: 'demo' });
  };

  return <button onClick={handleClick}>Click me</button>;
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserHistoryExample;
