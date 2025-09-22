import { getMCPProtocol } from './server/mcp-protocol.js';

try {
  console.log("Attempting to initialize MCPProtocol...");
  const mcp = getMCPProtocol();
  console.log("MCPProtocol initialized successfully.");
} catch (error) {
  console.error("Failed to initialize MCPProtocol:", error);
}
