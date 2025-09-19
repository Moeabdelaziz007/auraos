import { Button } from "@/components/ui/button";

const Workspace = () => {
  const tools = [
    { name: "Workflow Automator", icon: "fas fa-cogs", description: "Create and manage automated workflows." },
    { name: "API Integrator", icon: "fas fa-plug", description: "Connect to and integrate with various APIs." },
    { name: "Real-time Monitor", icon: "fas fa-chart-line", description: "Monitor real-time data streams and events." },
    { name: "Content Generator", icon: "fas fa-file-alt", description: "Generate high-quality content for your social media." },
  ];

  const agents = [
    { name: "Workflow Automation Master", description: "Specializes in creating and managing automated workflows" },
    { name: "Project Coordinator", description: "Coordinates multiple agents and manages complex projects" },
    { name: "Self-Improving AI", description: "Continuously learns and improves from interactions" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">AI Workspace</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your central hub for leveraging powerful AI tools and agents. Here you can manage workflows, interact with MCP tools, and deploy intelligent agents to automate your tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">MCP Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tools.map((tool, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-4 flex items-start gap-4 hover:bg-primary/10 transition-colors">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <i className={`${tool.icon} text-primary text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold mb-4">Improvement Agents</h2>
              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-4 hover:bg-primary/10 transition-colors">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2">Interact</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass-card p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
            <div className="prose prose-invert max-w-none">
                <ul>
                    <li><a href="#">Customize your Firebase Studio workspace</a></li>
                    <li><a href="#">Develop, publish, and monitor a full-stack web app with the App Prototyping agent</a></li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Workspace;
