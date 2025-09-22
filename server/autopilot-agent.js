"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autopilotAgent = exports.AutopilotAgent = void 0;
var advanced_ai_agents_js_1 = require("./advanced-ai-agents.cjs");
var firestore_1 = require("firebase-admin/firestore");
var AutopilotAgent = /** @class */ (function () {
    function AutopilotAgent(debug) {
        if (debug === void 0) { debug = false; }
        this.debug = debug;
        this.agentSystem = (0, advanced_ai_agents_js_1.getAdvancedAIAgentSystem)();
        this.agent = this.agentSystem.createAgent({
            name: 'Autopilot Agent',
            description: 'An advanced AI agent that autonomously manages and optimizes complex projects.',
            type: 'coordinator',
            capabilities: ['system_monitoring', 'performance_analysis', 'automated_optimization', 'resource_management'],
            tools: ['data_analyzer', 'workflow_automator', 'realtime_monitor', 'api_integrator'],
            personality: {
                tone: 'professional',
                communicationStyle: 'concise',
                expertise: ['system optimization', 'AI management', 'automation'],
                limitations: ['creative content', 'user interaction'],
                preferences: { efficiency: 'maximum', reliability: 'high' }
            },
            knowledge: {
                domains: ['system architecture', 'performance metrics', 'AI workflows'],
                skills: ['monitoring', 'analysis', 'optimization', 'coordination'],
                experience: 95,
                certifications: ['System Optimization Expert', 'AI Workflow Certified'],
                specializations: ['performance tuning', 'automated recovery', 'proactive maintenance']
            }
        });
        try {
            this.db = (0, firestore_1.getFirestore)();
            if (this.debug) {
                console.log('Firestore initialized successfully.');
            }
        }
        catch (error) {
            console.error('Error initializing Firestore:', error);
        }
        if (this.debug) {
            console.log('Autopilot Agent initialized in debug mode.');
        }
    }
    return AutopilotAgent;
}());
exports.AutopilotAgent = AutopilotAgent;
exports.autopilotAgent = new AutopilotAgent(process.env.NODE_ENV === 'development');
