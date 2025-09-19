import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, CheckCircle, XCircle, Languages, Globe } from "lucide-react";

export default function MultilingualAssistantApp() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("auto");
  const [userProfile, setUserProfile] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAssistant = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const response = await fetch("http://localhost:3001/mcp/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "multilingual_assistant",
          params: {
            message,
            language,
            user_profile: userProfile ? JSON.parse(userProfile) : undefined,
            context,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute Multilingual Assistant");
      }

      const data = await response.json();
      setOutput(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" /> Multilingual Assistant
        </CardTitle>
        <p className="text-muted-foreground">
          Advanced AI assistant with Arabic and English support for technical creativity, education, and wellness.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message</label>
          <Textarea
            id="message"
            placeholder="Type your message in Arabic or English..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-foreground mb-1">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="arabic">Arabic (العربية)</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="userProfile" className="block text-sm font-medium text-foreground mb-1">User Profile (JSON)</label>
            <Input
              id="userProfile"
              placeholder='{"id": "user123", "name": "John"}'
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-foreground mb-1">Context (optional)</label>
          <Textarea
            id="context"
            placeholder="Additional context for the conversation"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
        </div>

        <Button onClick={executeAssistant} disabled={loading || !message} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute Assistant
            </>
          )}
        </Button>

        {error && (
          <div className="mt-4 text-red-500 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Error: {error}
          </div>
        )}

        {output && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Response
            </h3>
            <Card className="bg-muted/20 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Language:</span>
                  <span className="text-sm">{output.detected_language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm">{output.response_type}</span>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium">Response:</span>
                  <div className="mt-1 p-3 bg-background rounded-lg whitespace-pre-wrap text-sm">
                    {output.response}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium">Capabilities:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {output.capabilities?.map((capability: string, index: number) => (
                      <span key={index} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
