import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, CheckCircle, XCircle, Settings, Cpu, Server, Database as DatabaseIcon, Container, Monitor, Clock, Component } from "lucide-react";

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
    <Card className="w-full border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> System Designer
        </CardTitle>
        <CardDescription>
          Design complex software architectures by defining your requirements and technology stack.
        </CardDescription>
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

        <div className="grid grid-cols-1 gap-4">
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
        </div>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="frontend" className="block text-sm font-medium text-foreground mb-1">Frontend</label>
              <Select value={frontend} onValueChange={setFrontend}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select frontend" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Vue">Vue</SelectItem>
                  <SelectItem value="Angular">Angular</SelectItem>
                  <SelectItem value="Svelte">Svelte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="backend" className="block text-sm font-medium text-foreground mb-1">Backend</label>
              <Select value={backend} onValueChange={setBackend}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select backend" /></SelectTrigger>
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
                <SelectTrigger className="w-full"><SelectValue placeholder="Select database" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="Redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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

        <AnimatePresence>
          {output && (
            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> System Design Output
              </h3>
              <Card className="bg-muted/20 border-dashed">
                <CardContent className="p-4 md:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /> Frontend</h4>
                      <p className="text-sm text-muted-foreground">Framework: {output.system_design?.architecture?.frontend?.framework}</p>
                      <p className="text-sm text-muted-foreground">State: {output.system_design?.architecture?.frontend?.state_management}</p>
                      <p className="text-sm text-muted-foreground">Styling: {output.system_design?.architecture?.frontend?.styling}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Backend</h4>
                      <p className="text-sm text-muted-foreground">Framework: {output.system_design?.architecture?.backend?.framework}</p>
                      <p className="text-sm text-muted-foreground">Database: {output.system_design?.architecture?.backend?.database}</p>
                      <p className="text-sm text-muted-foreground">Cache: {output.system_design?.architecture?.backend?.cache}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2"><Container className="h-5 w-5 text-primary" /> Infrastructure</h4>
                      <p className="text-sm text-muted-foreground">Container: {output.system_design?.architecture?.infrastructure?.containerization}</p>
                      <p className="text-sm text-muted-foreground">Orchestration: {output.system_design?.architecture?.infrastructure?.orchestration}</p>
                      <p className="text-sm text-muted-foreground">Monitoring: {output.system_design?.architecture?.infrastructure?.monitoring}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3"><Component className="h-5 w-5 text-primary" /> Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {output.system_design?.components?.map((component: string, index: number) => (
                        <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          {component}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="text-sm space-y-2">
                      {output.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/40 px-4 md:px-6 py-3 flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Complexity:</span> {output.complexity}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-foreground">Est. Time:</span> {output.estimated_development_time}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
