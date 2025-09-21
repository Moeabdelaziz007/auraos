
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DebugView from './pages/DebugView';
import Workspace from './pages/Workspace';
import AdvancedAITools from './pages/advanced-ai-tools';
import AIAgents from './pages/ai-agents';
import Dashboard from './pages/dashboard';
import Loading from './pages/loading';
import Login from './pages/login';
import NotFound from './pages/not-found';
import SmartLearning from './pages/smart-learning';
import SocialFeed from './pages/social-feed';
import Telegram from './pages/telegram';
import Workflows from './pages/workflows';
import AITravelAgencyPage from './pages/ai-travel-agency';
import MCPTools from './pages/mcp-tools';
import PromptLibrary from './pages/prompt-library';
import LearningDashboard from './pages/learning-dashboard';
import Analytics from './pages/analytics';
import Settings from './pages/settings';

const AllRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/advanced-ai-tools" element={<AdvancedAITools />} />
      <Route path="/ai-agents" element={<AIAgents />} />
      <Route path="/smart-learning" element={<SmartLearning />} />
      <Route path="/social-feed" element={<SocialFeed />} />
      <Route path="/telegram" element={<Telegram />} />
      <Route path="/workflows" element={<Workflows />} />
      <Route path="/ai-travel-agency" element={<AITravelAgencyPage />} />
      <Route path="/debug" element={<DebugView />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/mcp-tools" element={<MCPTools />} />
      <Route path="/prompt-library" element={<PromptLibrary />} />
      <Route path="/learning" element={<LearningDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AllRoutes;
