const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server(
  {
    name: 'test-kite-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Mock tool implementations
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'get_positions',
        description: 'Get current positions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_holdings',
        description: 'Get current holdings',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'place_order',
        description: 'Place a new order',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string' },
            quantity: { type: 'number' },
            side: { type: 'string', enum: ['BUY', 'SELL'] },
            orderType: { type: 'string', enum: ['MARKET', 'LIMIT'] },
          },
          required: ['symbol', 'quantity', 'side'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'get_positions':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              positions: [
                { symbol: 'TCS', quantity: 100, averagePrice: 3500 },
                { symbol: 'INFY', quantity: 50, averagePrice: 1500 },
              ],
            }, null, 2),
          },
        ],
      };
      
    case 'get_holdings':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              holdings: [
                { symbol: 'TCS', quantity: 100, averagePrice: 3500 },
                { symbol: 'INFY', quantity: 50, averagePrice: 1500 },
              ],
            }, null, 2),
          },
        ],
      };
      
    case 'place_order':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              orderId: `ORDER_${Date.now()}`,
              status: 'SUBMITTED',
              symbol: args.symbol,
              quantity: args.quantity,
              side: args.side,
              orderType: args.orderType || 'MARKET',
            }, null, 2),
          },
        ],
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport);

console.error('Test MCP Server started'); 