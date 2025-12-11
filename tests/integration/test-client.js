#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

// Create a simple test client to demonstrate interaction with the MCP server
async function testClient() {
  console.log('🧪 Testing MCP Server interaction...');
  
  const client = new Client(
    {
      name: "test-client",
      version: "0.1.0"
    },
    {
      capabilities: {}
    }
  );

  // Create transport to communicate with the server
  const serverPath = path.resolve(process.cwd(), "dist", "index.js");
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: { ...process.env, USE_HTTP: "false" }
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // List available tools
    const tools = await client.listTools();
    console.log('📋 Available tools:', tools.tools.map(t => t.name));

      // Test ct_gov_studies tool
  try {
    console.log('🔬 Testing ct_gov_studies tool...');
    const result = await client.callTool({
      name: 'ct_gov_studies',
        arguments: { 
          method: 'search',
          condition: 'Diabetes',
          limit: 5
        }
      });
      console.log('✅ CT.gov unified tool result:', result.content[0].text.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ CT.gov unified tool error:', error.message);
    }

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await transport.close();
  }
}

// Run the test
testClient(); 