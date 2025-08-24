import { azure } from '@ai-sdk/azure';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  UIMessage,
  convertToModelMessages,
  experimental_createMCPClient,
  experimental_generateImage,
  hasToolCall,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import { NextResponse } from 'next/server';
import z from 'zod';
import { auth } from '@/auth';

export const POST = auth(async function POST(req) {
  const { messages, model }: { messages: UIMessage[]; model: string } = await req.json();
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

  const generateImage = tool({
    description: 'Generate an image',
    inputSchema: z.object({
      prompt: z.string().describe('The prompt to generate the image from'),
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: azure.image('Dalle3'),
        size: '1024x1024',
        prompt,
        maxImagesPerCall: 1,
      });
      return { image: image.base64, mediaType: image.mediaType, prompt };
    },
  });

  if (model === 'Dalle3') {
    const result = streamText({
      model: azure('gpt-5-chat'),
      tools: {
        generateImage,
      },
      messages: convertToModelMessages(messages),
    });

    if (req.auth) return result.toUIMessageStreamResponse();
  }

  const McpClient = await experimental_createMCPClient({
    transport,
  });

  const result = streamText({
    model: azure(model || 'gpt-5-chat'),
    tools: await McpClient.tools(),
    messages: convertToModelMessages(messages),
    stopWhen: [stepCountIs(2), hasToolCall('roll-dice')],
  });

  if (req.auth) return result.toUIMessageStreamResponse();

  return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
});
