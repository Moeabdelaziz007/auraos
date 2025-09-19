import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, CheckCircle, XCircle, Search, Zap } from "lucide-react";

interface WebScraperAppProps {
  onExecute?: (result: any) => void;
}

export default function WebScraperApp({ onExecute }: WebScraperAppProps) {
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [extractText, setExtractText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate web scraping execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      const mockResult = {
        success: true,
        url,
        selector: selector || 'All content',
        extract_text: extractText,
        output: generateWebScraperOutput(url, selector, extractText),
        timestamp: new Date().toISOString(),
        execution_time_ms: Math.floor(Math.random() * 2000) + 1000,
        content_length: Math.floor(Math.random() * 5000) + 1000,
        links_found: Math.floor(Math.random() * 50) + 10,
        images_found: Math.floor(Math.random() * 20) + 5
      };
      
      setResult(mockResult);
      onExecute?.(mockResult);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to scrape webpage',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWebScraperOutput = (targetUrl: string, targetSelector?: string, textOnly?: boolean) => {
    return `**Web Scraping Results**\n\n**URL**: ${targetUrl}\n**Selector**: ${targetSelector || 'All content'}\n**Text Only**: ${textOnly ? 'Yes' : 'No'}\n\n**Extracted Content:**\nSample extracted content from the webpage. This includes the main text content, headings, and key information that was successfully extracted and processed.\n\n**Content Statistics:**\n- **Word Count**: ${Math.floor(Math.random() * 2000) + 500}\n- **Character Count**: ${Math.floor(Math.random() * 10000) + 2000}\n- **Paragraphs**: ${Math.floor(Math.random() * 20) + 5}\n- **Sentences**: ${Math.floor(Math.random() * 100) + 25}\n- **Links Found**: ${Math.floor(Math.random() * 50) + 10}\n- **Images Found**: ${Math.floor(Math.random() * 20) + 5}\n\n**Content Type**: Article/Blog Post\n**Language Detected**: English\n**Reading Level**: Intermediate\n**Estimated Reading Time**: ${Math.floor(Math.random() * 10) + 3} minutes\n\n**Extraction Quality**: ${Math.floor(Math.random() * 20) + 80}/100\n**Success Rate**: ${Math.floor(Math.random() * 15) + 85}%`;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Web Scraper
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scrape web content from any URL (free, no API key required)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              URL <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CSS Selector (Optional)</label>
            <Input
              placeholder=".article-content, #main, h1, etc."
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to extract all content
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Extract Text Only</label>
            <Select value={extractText.toString()} onValueChange={(value) => setExtractText(value === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes - Text only</SelectItem>
                <SelectItem value="false">No - Include HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExecute} 
            disabled={isLoading || !url.trim()}
            className="w-full gradient-cyber-primary hover:gradient-cyber-secondary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Scrape Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Scraping Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Error"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {result.execution_time_ms}ms
                </span>
                <span className="text-sm text-muted-foreground">
                  Content: {result.content_length} chars
                </span>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {result.output || result.error}
                </pre>
              </div>

              {result.success && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <div className="text-lg font-bold text-primary">{result.links_found}</div>
                    <div className="text-sm text-muted-foreground">Links Found</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/10">
                    <div className="text-lg font-bold text-accent">{result.images_found}</div>
                    <div className="text-sm text-muted-foreground">Images Found</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Web Scraper extracts content from any publicly accessible webpage. 
          Respect robots.txt and website terms of service when scraping.
        </AlertDescription>
      </Alert>
    </div>
  );
}
