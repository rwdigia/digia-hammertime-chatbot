import { azure } from '@ai-sdk/azure';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { UIMessage, convertToModelMessages, experimental_createMCPClient, stepCountIs, streamText } from 'ai';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const POST = auth(async function POST(req) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const accessToken = req.auth?.accessToken;

  const transport = new StreamableHTTPClientTransport(
    new URL(process.env.NEXT_PUBLIC_DIGIA_HAMMERTIME_MCPSERVER_URL || 'http://localhost:4000/mcp'),
    {
      fetch: async (input, init = {}) => {
        const headers = new Headers(init.headers);
        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return fetch(input, {
          ...init,
          headers,
        });
      },
    },
  );

  const McpClient = await experimental_createMCPClient({
    transport,
  });

  const result = streamText({
    model: azure('gpt-5-chat'),
    tools: await McpClient.tools(),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(2),
  });

  if (req.auth) return result.toUIMessageStreamResponse();

  return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
});
