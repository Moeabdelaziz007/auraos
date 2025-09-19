import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, CheckCircle, XCircle, Settings } from "lucide-react";

export default function SystemDesignerApp() {
  const [requirements, setRequirements] = useState("");
  const [complexity, setComplexity] = useState("medium");
  const [frontend, setFrontend] = useState("React");
  const [backend, setBackend] = useState("FastAPI");
  const [database, setDatabase] = useState("PostgreSQL");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeDesigner = async () => {
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
          tool: "system_designer",
          params: {
            requirements,
            complexity,
            technology_stack: {
              frontend,
              backend,
              database
            },
            context,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute System Designer");
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
          <Settings className="h-5 w-5" /> System Designer
        </CardTitle>
        <p className="text-muted-foreground">
          AI-powered system architecture designer for technical creativity and solution planning.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-1">Requirements</label>
          <Textarea
            id="requirements"
            placeholder="Describe your system requirements and specifications..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="complexity" className="block text-sm font-medium text-foreground mb-1">Complexity</label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="frontend" className="block text-sm font-medium text-foreground mb-1">Frontend</label>
            <Select value={frontend} onValueChange={setFrontend}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frontend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="Vue">Vue</SelectItem>
                <SelectItem value="Angular">Angular</SelectItem>
                <SelectItem value="Svelte">Svelte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="backend" className="block text-sm font-medium text-foreground mb-1">Backend</label>
            <Select value={backend} onValueChange={setBackend}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select backend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FastAPI">FastAPI</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Django">Django</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="database" className="block text-sm font-medium text-foreground mb-1">Database</label>
            <Select value={database} onValueChange={setDatabase}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MySQL">MySQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="Redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-foreground mb-1">Context (optional)</label>
          <Textarea
            id="context"
            placeholder="Additional context for system design"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
        </div>

        <Button onClick={executeDesigner} disabled={loading || !requirements} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Designing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Design System
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
              <CheckCircle className="h-5 w-5 text-green-500" /> System Design
            </h3>
            <Card className="bg-muted/20 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Architecture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frontend:</span>
                      <div className="mt-1 space-y-1">
                        <div>Framework: {output.system_design?.architecture?.frontend?.framework}</div>
                        <div>State: {output.system_design?.architecture?.frontend?.state_management}</div>
                        <div>Styling: {output.system_design?.architecture?.frontend?.styling}</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Backend:</span>
                      <div className="mt-1 space-y-1">
                        <div>Framework: {output.system_design?.architecture?.backend?.framework}</div>
                        <div>Database: {output.system_design?.architecture?.backend?.database}</div>
                        <div>Cache: {output.system_design?.architecture?.backend?.cache}</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Infrastructure:</span>
                      <div className="mt-1 space-y-1">
                        <div>Container: {output.system_design?.architecture?.infrastructure?.containerization}</div>
                        <div>Orchestration: {output.system_design?.architecture?.infrastructure?.orchestration}</div>
                        <div>Monitoring: {output.system_design?.architecture?.infrastructure?.monitoring}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Components</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {output.system_design?.components?.map((component: string, index: number) => (
                      <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        {component}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {output.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-medium">Complexity:</span> {output.complexity}
                  </div>
                  <div>
                    <span className="font-medium">Est. Time:</span> {output.estimated_development_time}
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
