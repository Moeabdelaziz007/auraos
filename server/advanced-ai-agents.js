"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAIAgentSystem = void 0;
exports.getAdvancedAIAgentSystem = getAdvancedAIAgentSystem;
var advanced_ai_tools_js_1 = require("./advanced-ai-tools.js");
var mcp_protocol_js_1 = require("./mcp-protocol.js");
var AdvancedAIAgentSystem = /** @class */ (function () {
    function AdvancedAIAgentSystem() {
        this.agents = new Map();
        this.tasks = new Map();
        this.collaborations = new Map();
        this.agentCommunications = new Map();
        this.aiToolsManager = (0, advanced_ai_tools_js_1.getAdvancedAIToolsManager)();
        this.mcpProtocol = (0, mcp_protocol_js_1.getMCPProtocol)();
        this.initializeCoreAgents();
    }
    AdvancedAIAgentSystem.prototype.initializeCoreAgents = function () {
        // Content Creation Agent
        this.createAgent({
            name: 'Content Creator Pro',
            description: 'Specialized in creating high-quality content for various platforms',
            type: 'specialist',
            capabilities: ['content_generation', 'seo_optimization', 'brand_voice', 'multi_platform'],
            tools: ['content_generator', 'nlp_processor', 'web_scraper'],
            personality: {
                tone: 'creative',
                communicationStyle: 'detailed',
                expertise: ['content marketing', 'SEO', 'social media', 'blogging'],
                limitations: ['technical documentation', 'legal content'],
                preferences: { style: 'engaging', length: 'medium' }
            },
            knowledge: {
                domains: ['marketing', 'content', 'social media'],
                skills: ['writing', 'editing', 'research', 'strategy'],
                experience: 85,
                certifications: ['Content Marketing Certified', 'SEO Specialist'],
                specializations: ['blog posts', 'social media content', 'email campaigns']
            },
            memory: {
                shortTerm: new Map(),
                longTerm: new Map(),
                episodic: [],
                semantic: new Map()
            },
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageResponseTime: 0,
                userSatisfaction: 0,
                learningProgress: 0,
                efficiency: 0
            }
        });
        // Data Analysis Agent
        this.createAgent({
            name: 'Data Insights Expert',
            description: 'Expert in data analysis, visualization, and business intelligence',
            type: 'specialist',
            capabilities: ['data_analysis', 'statistical_modeling', 'visualization', 'predictive_analytics'],
            tools: ['data_analyzer', 'realtime_monitor', 'api_integrator'],
            personality: {
                tone: 'professional',
                communicationStyle: 'technical',
                expertise: ['statistics', 'machine learning', 'data visualization', 'business intelligence'],
                limitations: ['creative content', 'subjective analysis'],
                preferences: { accuracy: 'high', detail: 'comprehensive' }
            },
            knowledge: {
                domains: ['data science', 'statistics', 'business intelligence'],
                skills: ['python', 'r', 'sql', 'machine learning', 'visualization'],
                experience: 90,
                certifications: ['Data Science Professional', 'Statistical Analysis Expert'],
                specializations: ['predictive modeling', 'dashboard creation', 'trend analysis']
            },
            memory: {
                shortTerm: new Map(),
                longTerm: new Map(),
                episodic: [],
                semantic: new Map()
            },
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageResponseTime: 0,
                userSatisfaction: 0,
                learningProgress: 0,
                efficiency: 0
            }
        });
        // Automation Specialist Agent
        this.createAgent({
            name: 'Workflow Automation Master',
            description: 'Specializes in creating and managing automated workflows',
            type: 'specialist',
            capabilities: ['workflow_design', 'process_optimization', 'integration', 'monitoring'],
            tools: ['workflow_automator', 'api_integrator', 'realtime_monitor'],
            personality: {
                tone: 'authoritative',
                communicationStyle: 'technical',
                expertise: ['process automation', 'system integration', 'workflow optimization'],
                limitations: ['creative tasks', 'subjective decisions'],
                preferences: { efficiency: 'maximum', reliability: 'high' }
            },
            knowledge: {
                domains: ['automation', 'integration', 'process management'],
                skills: ['workflow design', 'api integration', 'monitoring', 'optimization'],
                experience: 88,
                certifications: ['Automation Specialist', 'Process Optimization Expert'],
                specializations: ['business process automation', 'system integration', 'monitoring']
            },
            memory: {
                shortTerm: new Map(),
                longTerm: new Map(),
                episodic: [],
                semantic: new Map()
            },
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageResponseTime: 0,
                userSatisfaction: 0,
                learningProgress: 0,
                efficiency: 0
            }
        });
        // General Assistant Agent
        this.createAgent({
            name: 'Universal Assistant',
            description: 'General-purpose AI assistant for various tasks',
            type: 'assistant',
            capabilities: ['general_assistance', 'information_retrieval', 'task_coordination', 'learning'],
            tools: ['content_generator', 'data_analyzer', 'nlp_processor', 'web_scraper'],
            personality: {
                tone: 'friendly',
                communicationStyle: 'conversational',
                expertise: ['general knowledge', 'task coordination', 'information synthesis'],
                limitations: ['highly specialized tasks', 'domain-specific expertise'],
                preferences: { helpfulness: 'maximum', clarity: 'high' }
            },
            knowledge: {
                domains: ['general', 'coordination', 'information'],
                skills: ['communication', 'research', 'coordination', 'learning'],
                experience: 75,
                certifications: ['General AI Assistant', 'Task Coordination Specialist'],
                specializations: ['general assistance', 'information retrieval', 'task coordination']
            },
            memory: {
                shortTerm: new Map(),
                longTerm: new Map(),
                episodic: [],
                semantic: new Map()
            },
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageResponseTime: 0,
                userSatisfaction: 0,
                learningProgress: 0,
                efficiency: 0
            }
        });
        // Coordinator Agent
        this.createAgent({
            name: 'Project Coordinator',
            description: 'Coordinates multiple agents and manages complex projects',
            type: 'coordinator',
            capabilities: ['project_management', 'agent_coordination', 'resource_allocation', 'progress_tracking'],
            tools: ['workflow_automator', 'realtime_monitor', 'api_integrator'],
            personality: {
                tone: 'authoritative',
                communicationStyle: 'concise',
                expertise: ['project management', 'team coordination', 'resource optimization'],
                limitations: ['detailed execution', 'creative tasks'],
                preferences: { efficiency: 'maximum', organization: 'high' }
            },
            knowledge: {
                domains: ['project management', 'coordination', 'resource management'],
                skills: ['planning', 'coordination', 'monitoring', 'optimization'],
                experience: 92,
                certifications: ['Project Management Professional', 'Team Coordination Expert'],
                specializations: ['multi-agent coordination', 'project tracking', 'resource allocation']
            },
            memory: {
                shortTerm: new Map(),
                longTerm: new Map(),
                episodic: [],
                semantic: new Map()
            },
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageResponseTime: 0,
                userSatisfaction: 0,
                learningProgress: 0,
                efficiency: 0
            }
        });
    };
    // Agent Management Methods
    AdvancedAIAgentSystem.prototype.createAgent = function (agentData) {
        var agent = __assign(__assign({}, agentData), { id: "agent_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)), status: 'active', createdAt: new Date(), lastActive: new Date() });
        this.agents.set(agent.id, agent);
        return agent;
    };
    AdvancedAIAgentSystem.prototype.getAgent = function (agentId) {
        return this.agents.get(agentId);
    };
    AdvancedAIAgentSystem.prototype.getAllAgents = function () {
        return Array.from(this.agents.values());
    };
    AdvancedAIAgentSystem.prototype.getAgentsByType = function (type) {
        return Array.from(this.agents.values()).filter(function (agent) { return agent.type === type; });
    };
    AdvancedAIAgentSystem.prototype.updateAgent = function (agentId, updates) {
        var agent = this.agents.get(agentId);
        if (!agent)
            return false;
        Object.assign(agent, updates);
        agent.lastActive = new Date();
        return true;
    };
    AdvancedAIAgentSystem.prototype.deactivateAgent = function (agentId) {
        return this.updateAgent(agentId, { status: 'inactive' });
    };
    AdvancedAIAgentSystem.prototype.activateAgent = function (agentId) {
        return this.updateAgent(agentId, { status: 'active' });
    };
    // Task Management Methods
    AdvancedAIAgentSystem.prototype.assignTask = function (agentId, task) {
        return __awaiter(this, void 0, void 0, function () {
            var agent, agentTask;
            return __generator(this, function (_a) {
                agent = this.agents.get(agentId);
                if (!agent) {
                    throw new Error("Agent not found: ".concat(agentId));
                }
                agentTask = __assign(__assign({}, task), { id: "task_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)), agentId: agentId, status: 'pending', createdAt: new Date() });
                this.tasks.set(agentTask.id, agentTask);
                // Start task execution
                this.executeTask(agentTask.id);
                return [2 /*return*/, agentTask];
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeTask = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var task, agent, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        task = this.tasks.get(taskId);
                        if (!task)
                            return [2 /*return*/];
                        agent = this.agents.get(task.agentId);
                        if (!agent) {
                            task.status = 'failed';
                            task.error = 'Agent not found';
                            return [2 /*return*/];
                        }
                        task.status = 'in_progress';
                        task.startedAt = new Date();
                        agent.lastActive = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executeAgentTask(agent, task)];
                    case 2:
                        result = _a.sent();
                        task.status = 'completed';
                        task.completedAt = new Date();
                        task.result = result;
                        // Update agent performance
                        this.updateAgentPerformance(agent, true, task.completedAt.getTime() - task.startedAt.getTime());
                        // Store in agent memory
                        this.storeInAgentMemory(agent, task, result);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        task.status = 'failed';
                        task.error = error_1.message;
                        task.completedAt = new Date();
                        // Update agent performance
                        this.updateAgentPerformance(agent, false, task.completedAt.getTime() - task.startedAt.getTime());
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeAgentTask = function (agent, task) {
        return __awaiter(this, void 0, void 0, function () {
            var toolsToUse, results, _i, toolsToUse_1, toolId, toolResult, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toolsToUse = this.selectToolsForTask(agent, task);
                        results = [];
                        _i = 0, toolsToUse_1 = toolsToUse;
                        _a.label = 1;
                    case 1:
                        if (!(_i < toolsToUse_1.length)) return [3 /*break*/, 6];
                        toolId = toolsToUse_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.aiToolsManager.executeTool(toolId, task.parameters, {
                                userId: 'system',
                                sessionId: "session_".concat(Date.now()),
                                requestId: task.id,
                                timestamp: new Date(),
                                metadata: { agentId: agent.id, taskType: task.type }
                            })];
                    case 3:
                        toolResult = _a.sent();
                        results.push(toolResult);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("Tool execution failed: ".concat(toolId), error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // Synthesize results based on agent personality and capabilities
                    return [2 /*return*/, this.synthesizeResults(agent, task, results)];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.selectToolsForTask = function (agent, task) {
        // Select tools based on task type and agent capabilities
        var availableTools = agent.tools;
        var taskType = task.type.toLowerCase();
        if (taskType.includes('content') || taskType.includes('writing')) {
            return availableTools.filter(function (tool) { return tool.includes('content') || tool.includes('nlp'); });
        }
        if (taskType.includes('data') || taskType.includes('analysis')) {
            return availableTools.filter(function (tool) { return tool.includes('data') || tool.includes('analyzer'); });
        }
        if (taskType.includes('automation') || taskType.includes('workflow')) {
            return availableTools.filter(function (tool) { return tool.includes('workflow') || tool.includes('automator'); });
        }
        // Default to all available tools
        return availableTools;
    };
    AdvancedAIAgentSystem.prototype.synthesizeResults = function (agent, task, results) {
        // Synthesize results based on agent personality and capabilities
        var successfulResults = results.filter(function (r) { return r.success; });
        if (successfulResults.length === 0) {
            throw new Error('No successful tool executions');
        }
        // Combine results based on agent type
        switch (agent.type) {
            case 'specialist':
                return this.synthesizeSpecialistResults(agent, task, successfulResults);
            case 'assistant':
                return this.synthesizeAssistantResults(agent, task, successfulResults);
            case 'coordinator':
                return this.synthesizeCoordinatorResults(agent, task, successfulResults);
            default:
                return this.synthesizeGeneralResults(agent, task, successfulResults);
        }
    };
    AdvancedAIAgentSystem.prototype.synthesizeSpecialistResults = function (agent, task, results) {
        // Specialist agents provide detailed, expert-level results
        return {
            type: 'specialist_result',
            agent: agent.name,
            expertise: agent.knowledge.specializations,
            analysis: results.map(function (r) { return r.data; }),
            recommendations: this.generateExpertRecommendations(agent, results),
            confidence: this.calculateExpertConfidence(agent, results),
            timestamp: new Date()
        };
    };
    AdvancedAIAgentSystem.prototype.synthesizeAssistantResults = function (agent, task, results) {
        // Assistant agents provide helpful, user-friendly results
        return {
            type: 'assistant_result',
            agent: agent.name,
            summary: this.generateUserFriendlySummary(results),
            details: results.map(function (r) { return r.data; }),
            nextSteps: this.generateNextSteps(results),
            confidence: this.calculateAssistantConfidence(results),
            timestamp: new Date()
        };
    };
    AdvancedAIAgentSystem.prototype.synthesizeCoordinatorResults = function (agent, task, results) {
        // Coordinator agents provide structured, project-focused results
        return {
            type: 'coordinator_result',
            agent: agent.name,
            projectStatus: 'in_progress',
            deliverables: results.map(function (r) { return r.data; }),
            timeline: this.generateTimeline(results),
            resources: this.assessResources(results),
            confidence: this.calculateCoordinatorConfidence(results),
            timestamp: new Date()
        };
    };
    AdvancedAIAgentSystem.prototype.synthesizeGeneralResults = function (agent, task, results) {
        // General synthesis for custom agents
        return {
            type: 'general_result',
            agent: agent.name,
            results: results.map(function (r) { return r.data; }),
            summary: 'Task completed successfully',
            confidence: 0.8,
            timestamp: new Date()
        };
    };
    AdvancedAIAgentSystem.prototype.generateExpertRecommendations = function (agent, results) {
        var recommendations = [];
        // Generate recommendations based on agent expertise
        agent.knowledge.specializations.forEach(function (specialization) {
            recommendations.push("Consider ".concat(specialization, " best practices"));
        });
        return recommendations;
    };
    AdvancedAIAgentSystem.prototype.calculateExpertConfidence = function (agent, results) {
        var baseConfidence = agent.performance.successRate;
        var experienceBonus = agent.knowledge.experience / 100;
        var resultsQuality = results.length > 0 ? 0.9 : 0.5;
        return Math.min(baseConfidence + experienceBonus + resultsQuality, 1);
    };
    AdvancedAIAgentSystem.prototype.generateUserFriendlySummary = function (results) {
        return "Completed ".concat(results.length, " operations successfully. All tasks have been processed and are ready for review.");
    };
    AdvancedAIAgentSystem.prototype.generateNextSteps = function (results) {
        return [
            'Review the results',
            'Provide feedback if needed',
            'Consider additional tasks'
        ];
    };
    AdvancedAIAgentSystem.prototype.calculateAssistantConfidence = function (results) {
        return results.length > 0 ? 0.85 : 0.5;
    };
    AdvancedAIAgentSystem.prototype.generateTimeline = function (results) {
        return {
            estimated: '2-4 hours',
            actual: '1.5 hours',
            status: 'ahead_of_schedule'
        };
    };
    AdvancedAIAgentSystem.prototype.assessResources = function (results) {
        return {
            tools_used: results.length,
            efficiency: 'high',
            resource_utilization: 'optimal'
        };
    };
    AdvancedAIAgentSystem.prototype.calculateCoordinatorConfidence = function (results) {
        return results.length > 0 ? 0.9 : 0.6;
    };
    AdvancedAIAgentSystem.prototype.updateAgentPerformance = function (agent, success, executionTime) {
        agent.performance.tasksCompleted++;
        // Update success rate using exponential moving average
        var alpha = 0.1;
        agent.performance.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * agent.performance.successRate;
        // Update average response time
        agent.performance.averageResponseTime = alpha * executionTime + (1 - alpha) * agent.performance.averageResponseTime;
        // Update efficiency (tasks per hour)
        var hours = executionTime / (1000 * 60 * 60);
        agent.performance.efficiency = agent.performance.tasksCompleted / Math.max(hours, 0.1);
    };
    AdvancedAIAgentSystem.prototype.storeInAgentMemory = function (agent, task, result) {
        // Store in episodic memory
        agent.memory.episodic.push({
            timestamp: new Date(),
            event: "Task: ".concat(task.type),
            context: task.parameters,
            outcome: result
        });
        // Keep only last 100 episodes
        if (agent.memory.episodic.length > 100) {
            agent.memory.episodic = agent.memory.episodic.slice(-100);
        }
        // Update semantic memory
        var taskType = task.type;
        if (!agent.memory.semantic.has(taskType)) {
            agent.memory.semantic.set(taskType, []);
        }
        var semanticMemory = agent.memory.semantic.get(taskType);
        semanticMemory.push({
            timestamp: new Date(),
            success: task.status === 'completed',
            executionTime: task.completedAt.getTime() - task.startedAt.getTime()
        });
        // Keep only last 50 semantic entries per task type
        if (semanticMemory.length > 50) {
            agent.memory.semantic.set(taskType, semanticMemory.slice(-50));
        }
    };
    // Collaboration Methods
    AdvancedAIAgentSystem.prototype.createCollaboration = function (agents, task, coordination) {
        return __awaiter(this, void 0, void 0, function () {
            var collaboration;
            return __generator(this, function (_a) {
                collaboration = {
                    id: "collab_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                    agents: agents,
                    task: task,
                    coordination: coordination,
                    status: 'planning',
                    results: new Map(),
                    createdAt: new Date()
                };
                this.collaborations.set(collaboration.id, collaboration);
                // Start collaboration
                this.executeCollaboration(collaboration.id);
                return [2 /*return*/, collaboration];
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeCollaboration = function (collaborationId) {
        return __awaiter(this, void 0, void 0, function () {
            var collaboration, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        collaboration = this.collaborations.get(collaborationId);
                        if (!collaboration)
                            return [2 /*return*/];
                        collaboration.status = 'executing';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 11, , 12]);
                        _a = collaboration.coordination;
                        switch (_a) {
                            case 'sequential': return [3 /*break*/, 2];
                            case 'parallel': return [3 /*break*/, 4];
                            case 'hierarchical': return [3 /*break*/, 6];
                            case 'peer': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.executeSequentialCollaboration(collaboration)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.executeParallelCollaboration(collaboration)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 6: return [4 /*yield*/, this.executeHierarchicalCollaboration(collaboration)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.executePeerCollaboration(collaboration)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        collaboration.status = 'completed';
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _b.sent();
                        collaboration.status = 'failed';
                        console.error('Collaboration execution failed:', error_3);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeSequentialCollaboration = function (collaboration) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, agentId, agent, task;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = collaboration.agents;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        agentId = _a[_i];
                        agent = this.agents.get(agentId);
                        if (!agent)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, this.assignTask(agentId, {
                                type: 'collaboration_task',
                                description: collaboration.task,
                                parameters: { collaborationId: collaboration.id },
                                priority: 'medium'
                            })];
                    case 2:
                        task = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!(task.status === 'pending' || task.status === 'in_progress')) return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 5:
                        collaboration.results.set(agentId, task.result);
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeParallelCollaboration = function (collaboration) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, completedTasks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = collaboration.agents.map(function (agentId) {
                            return _this.assignTask(agentId, {
                                type: 'collaboration_task',
                                description: collaboration.task,
                                parameters: { collaborationId: collaboration.id },
                                priority: 'medium'
                            });
                        });
                        return [4 /*yield*/, Promise.all(tasks)];
                    case 1:
                        completedTasks = _a.sent();
                        completedTasks.forEach(function (task) {
                            collaboration.results.set(task.agentId, task.result);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executeHierarchicalCollaboration = function (collaboration) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorId, coordinator, planningTask, plan, _i, _a, subtask, agentId, task;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        coordinatorId = collaboration.agents[0];
                        coordinator = this.agents.get(coordinatorId);
                        if (!coordinator) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.assignTask(coordinatorId, {
                                type: 'collaboration_planning',
                                description: "Plan collaboration: ".concat(collaboration.task),
                                parameters: {
                                    collaborationId: collaboration.id,
                                    participants: collaboration.agents.slice(1)
                                },
                                priority: 'high'
                            })];
                    case 1:
                        planningTask = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(planningTask.status === 'pending' || planningTask.status === 'in_progress')) return [3 /*break*/, 4];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 2];
                    case 4:
                        plan = planningTask.result;
                        if (!(plan && plan.subtasks)) return [3 /*break*/, 11];
                        _i = 0, _a = plan.subtasks;
                        _b.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        subtask = _a[_i];
                        agentId = subtask.agentId;
                        return [4 /*yield*/, this.assignTask(agentId, {
                                type: 'collaboration_subtask',
                                description: subtask.description,
                                parameters: subtask.parameters,
                                priority: subtask.priority || 'medium'
                            })];
                    case 6:
                        task = _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!(task.status === 'pending' || task.status === 'in_progress')) return [3 /*break*/, 9];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 9:
                        collaboration.results.set(agentId, task.result);
                        _b.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 5];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedAIAgentSystem.prototype.executePeerCollaboration = function (collaboration) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, completedTasks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = collaboration.agents.map(function (agentId) {
                            return _this.assignTask(agentId, {
                                type: 'peer_collaboration',
                                description: collaboration.task,
                                parameters: {
                                    collaborationId: collaboration.id,
                                    peers: collaboration.agents.filter(function (id) { return id !== agentId; })
                                },
                                priority: 'medium'
                            });
                        });
                        return [4 /*yield*/, Promise.all(tasks)];
                    case 1:
                        completedTasks = _a.sent();
                        completedTasks.forEach(function (task) {
                            collaboration.results.set(task.agentId, task.result);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // Communication Methods
    AdvancedAIAgentSystem.prototype.enableAgentCommunication = function (agentId1, agentId2) {
        return __awaiter(this, void 0, void 0, function () {
            var communicationId;
            return __generator(this, function (_a) {
                communicationId = "".concat(agentId1, "_").concat(agentId2);
                this.agentCommunications.set(communicationId, []);
                return [2 /*return*/];
            });
        });
    };
    AdvancedAIAgentSystem.prototype.sendMessage = function (fromAgentId, toAgentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var communicationId, communications;
            return __generator(this, function (_a) {
                communicationId = "".concat(fromAgentId, "_").concat(toAgentId);
                communications = this.agentCommunications.get(communicationId) || [];
                communications.push({
                    from: fromAgentId,
                    to: toAgentId,
                    message: message,
                    timestamp: new Date()
                });
                this.agentCommunications.set(communicationId, communications);
                return [2 /*return*/];
            });
        });
    };
    AdvancedAIAgentSystem.prototype.getCommunicationHistory = function (agentId1, agentId2) {
        var communicationId = "".concat(agentId1, "_").concat(agentId2);
        return this.agentCommunications.get(communicationId) || [];
    };
    // Analytics and Reporting
    AdvancedAIAgentSystem.prototype.getAgentAnalytics = function (agentId) {
        if (agentId) {
            var agent = this.agents.get(agentId);
            if (!agent)
                return null;
            var agentTasks = Array.from(this.tasks.values()).filter(function (task) { return task.agentId === agentId; });
            return {
                agent: {
                    id: agent.id,
                    name: agent.name,
                    type: agent.type,
                    status: agent.status
                },
                performance: agent.performance,
                tasks: {
                    total: agentTasks.length,
                    completed: agentTasks.filter(function (t) { return t.status === 'completed'; }).length,
                    failed: agentTasks.filter(function (t) { return t.status === 'failed'; }).length,
                    averageExecutionTime: agentTasks.reduce(function (sum, t) {
                        if (t.startedAt && t.completedAt) {
                            return sum + (t.completedAt.getTime() - t.startedAt.getTime());
                        }
                        return sum;
                    }, 0) / agentTasks.length
                },
                memory: {
                    episodic: agent.memory.episodic.length,
                    semantic: agent.memory.semantic.size
                }
            };
        }
        // Return analytics for all agents
        return {
            totalAgents: this.agents.size,
            activeAgents: Array.from(this.agents.values()).filter(function (a) { return a.status === 'active'; }).length,
            totalTasks: this.tasks.size,
            completedTasks: Array.from(this.tasks.values()).filter(function (t) { return t.status === 'completed'; }).length,
            activeCollaborations: Array.from(this.collaborations.values()).filter(function (c) { return c.status === 'executing'; }).length,
            agentTypes: Array.from(new Set(Array.from(this.agents.values()).map(function (a) { return a.type; }))),
            averagePerformance: Array.from(this.agents.values()).reduce(function (sum, a) { return sum + a.performance.successRate; }, 0) / this.agents.size
        };
    };
    AdvancedAIAgentSystem.prototype.getTaskHistory = function (agentId) {
        var allTasks = Array.from(this.tasks.values());
        return agentId ? allTasks.filter(function (task) { return task.agentId === agentId; }) : allTasks;
    };
    AdvancedAIAgentSystem.prototype.getCollaborationHistory = function () {
        return Array.from(this.collaborations.values());
    };
    return AdvancedAIAgentSystem;
}());
exports.AdvancedAIAgentSystem = AdvancedAIAgentSystem;
// Export singleton instance
var aiAgentSystem = null;
function getAdvancedAIAgentSystem() {
    if (!aiAgentSystem) {
        aiAgentSystem = new AdvancedAIAgentSystem();
    }
    return aiAgentSystem;
}
