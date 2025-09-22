import { storage } from './storage';
import { getTelegramService } from './telegram';
import type { Workflow, WorkflowNode } from '../shared/schema';

class WorkflowExecutor {
  async execute(workflowId: string, triggerContext: any) {
    console.log(`Executing workflow ${workflowId} with context:`, triggerContext);

    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow || !workflow.isActive) {
      console.log(`Workflow ${workflowId} not found or is not active.`);
      return;
    }

    const nodes = workflow.nodes as WorkflowNode[];
    const triggerNode = nodes.find(node => node.type.endsWith('-trigger'));

    if (!triggerNode) {
      console.error(`Workflow ${workflowId} has no trigger node.`);
      return;
    }

    let currentNode: WorkflowNode | undefined = triggerNode;
    let executionContext = { ...triggerContext };

    while (currentNode) {
      try {
        const result = await this.executeNode(currentNode, executionContext);
        executionContext = { ...executionContext, ...result };

        const nextNodeId = currentNode.data.next;
        if (nextNodeId) {
          currentNode = nodes.find(node => node.id === nextNodeId);
        } else {
          currentNode = undefined;
        }
      } catch (error) {
        console.error(`Error executing node ${currentNode.id} in workflow ${workflowId}:`, error);
        currentNode = undefined; // Stop execution on error
      }
    }

    console.log(`Finished executing workflow ${workflowId}.`);
  }

  private async executeNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`Executing node ${node.id} of type ${node.type}`);
    switch (node.type) {
      case 'telegram-send-message-action':
        return this.executeTelegramSendMessage(node, context);
      // Add other action types here
      default:
        console.log(`Node type ${node.type} has no execution logic.`);
        return {};
    }
  }

  private async executeTelegramSendMessage(node: WorkflowNode, context: any): Promise<any> {
    const telegramService = getTelegramService();
    if (!telegramService) {
      throw new Error("Telegram service not available.");
    }

    // Example: get chatId from the trigger context (e.g., the user who sent the message)
    const chatId = context.message?.chat.id;
    // Example: get message text from the node's configured data
    const messageText = node.data.message || "Hello from the workflow!";

    if (!chatId) {
      throw new Error("Chat ID is missing in the execution context.");
    }

    await telegramService.sendMessage(chatId, messageText);
    return { messageSent: true };
  }
}

export const workflowExecutor = new WorkflowExecutor();
