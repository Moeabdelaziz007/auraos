
import { Bot, Zap, Brain, Settings, Plug, Code, Search, FileText, Compass } from "lucide-react";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  category: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  personality: string;
  capabilities: string[];
  plugins: string[];
}

export const availablePlugins: Plugin[] = [
  {
    id: "web-scraper",
    name: "Web Scraper",
    description: "Scrapes web pages to extract information.",
    icon: <Search className="w-4 h-4" />,
    category: "Data Collection",
  },
  {
    id: "code-analyzer",
    name: "Code Analyzer",
    description: "Analyzes code for syntax, style, and potential bugs.",
    icon: <Code className="w-4 h-4" />,
    category: "Development",
  },
  {
    id: "text-summarizer",
    name: "Text Summarizer",
    description: "Summarizes long pieces of text.",
    icon: <FileText className="w-4 h-4" />,
    category: "Language",
  },
  {
    id: "navigation-expert",
    name: "Navigation Expert",
    description: "Provides directions and location-based information.",
    icon: <Compass className="w-4 h-4" />,
    category: "Utilities",
  },
];

export const availableAgents: Agent[] = [
  {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Gathers and summarizes information from the web.",
    icon: <Bot className="w-8 h-8" />,
    personality: "Analytical and thorough, provides detailed and well-structured information.",
    capabilities: ["Web Scraping", "Text Summarization", "Data Analysis"],
    plugins: ["web-scraper", "text-summarizer"],
  },
  {
    id: "travel-planner",
    name: "Travel Planner",
    description: "Helps plan trips and find local attractions.",
    icon: <Zap className="w-8 h-8" />,
    personality: "Friendly and helpful, provides personalized travel recommendations.",
    capabilities: ["Location-based Search", "Itinerary Planning", "Price Comparison"],
    plugins: ["navigation-expert"],
  },
];

export const codeAssistantAgent: Agent = {
  id: "code-assistant",
  name: "Code Assistant",
  description: "Assists with coding tasks, from generation to debugging.",
  icon: <Brain className="w-8 h-8" />,
  personality: "A versatile coding partner, fluent in multiple programming languages and development best practices.",
  capabilities: [
    "Code Generation",
    "Code Explanation",
    "Code Fixing & Debugging",
    "Test Generation",
    "Code Refactoring",
    "General Knowledge",
  ],
  plugins: ["code-analyzer", "web-scraper"],
};
