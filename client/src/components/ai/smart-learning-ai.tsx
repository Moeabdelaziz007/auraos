
import React from 'react';
import useMobile from '../../hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

const SmartLearningAI: React.FC = () => {
  const isMobile = useMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Learning AI</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Lesson 1: Introduction</AccordionTrigger>
              <AccordionContent>
                <p>This is the content for lesson 1. It is optimized for mobile viewing.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Lesson 2: Advanced Topics</AccordionTrigger>
              <AccordionContent>
                <p>This is the content for lesson 2. It is optimized for mobile viewing.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div>
            <h3 className="font-semibold">Lesson 1: Introduction</h3>
            <p>This is the content for lesson 1, designed for larger screens.</p>
            <h3 className="font-semibold mt-4">Lesson 2: Advanced Topics</h3>
            <p>This is the content for lesson 2, designed for larger screens.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartLearningAI;
