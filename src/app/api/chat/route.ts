import { azure } from '@ai-sdk/azure';
import { UIMessage, convertToModelMessages, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: azure('gpt-5-chat'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
