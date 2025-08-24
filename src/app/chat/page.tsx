'use client';

import { UIMessage, useChat } from '@ai-sdk/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useState } from 'react';
import Dice from '@/components/Dice';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ui/shadcn-io/ai/conversation';
import { Image as AiImage } from '@/components/ui/shadcn-io/ai/image';
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import { Response } from '@/components/ui/shadcn-io/ai/response';
import { Suggestion, Suggestions } from '@/components/ui/shadcn-io/ai/suggestion';
import { BubbleBackground } from '@/components/ui/shadcn-io/bubble-background';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

const models = [
  { id: 'gpt-5-chat', name: 'GPT-5 Chat' },
  { id: 'Dalle3', name: 'DALL-E 3' },
];

const starterPrompts = [
  { text: 'Roll dice', model: 'gpt-5-chat' },
  { text: 'Weather in Helsinki in Finnish', model: 'gpt-5-chat' },
  { text: 'A cat in a red Senior Trainee shirt', model: 'Dalle3' },
  {
    text: 'Get last 3 commits for main branch in rwdigia/digia-hammertime-mcpserver repository',
    model: 'gpt-5-chat',
  },
  { text: 'List todos', model: 'gpt-5-chat' },
  { text: 'BMI for 90kg and 183cm', model: 'gpt-5-chat' },
];

export default function Page() {
  const session = useSession();

  if (!session) {
    redirect('/');
  }

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(models[0].id);

  const { messages, sendMessage, status, setMessages } = useChat();

  function handleSuggestionClick({ text, model }: { text: string; model: string }) {
    setSelectedModel(model);
    sendMessage({ text }, { body: { model } });
  }

  const colors = {
    first: '255,28,69',
    second: '43,182,203',
    third: '226,255,109',
    fourth: '115,129,253',
    fifth: '255,255,255',
    sixth: '255,255,255',
  };

  return (
    <BubbleBackground interactive={true} colors={colors} className="from-gray-100 to-gray-300">
      <div className="relative z-10">
        <div className="w-[calc(100vw - 40px)] m-5 flex items-center justify-between rounded-full bg-white px-6 py-4">
          <div className="flex cursor-pointer items-center" onClick={() => setMessages([])}>
            <Image src="/digia-logo.svg" alt="Digia logo" width={85} height={34} priority />
            <div className="mb-1 ml-3 text-2xl font-semibold tracking-tighter">Hammertime</div>
          </div>
          <div className="flex items-center">
            <div className="mr-5 border-r-1 pr-5">
              <Link href="https://github.com/rwdigia/digia-hammertime-chatbot">Github</Link>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-full"
              onClick={() => signOut({ redirectTo: '/' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
        <div className="flex h-[calc(100vh-108px)] flex-col justify-center">
          <div className="mx-auto w-full max-w-[900px] px-4">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center p-8">
                <h2 className="mb-8 text-4xl text-white">How can I help you today?</h2>
                <Suggestions>
                  {starterPrompts.map((prompt) => (
                    <Suggestion
                      key={prompt.text}
                      suggestion={prompt.text}
                      onClick={() => handleSuggestionClick(prompt)}
                      className="font-normal"
                    />
                  ))}
                </Suggestions>
              </div>
            )}
            {messages.length > 0 && (
              <Conversation className="mb-4 h-[calc(100vh-110px-108px-18px-24px)] rounded-2xl border border-gray-100 bg-white">
                <ConversationContent>
                  {messages.map((message: UIMessage) => {
                    return (
                      <Message key={message.id} from={message.role}>
                        <MessageContent className="text-md px-5 py-4 group-[.is-assistant]:bg-gray-50 group-[.is-assistant]:text-gray-600 group-[.is-user]:bg-gray-50 group-[.is-user]:text-gray-600">
                          {message.parts?.map((part, index) => {
                            if (part.type === 'dynamic-tool' && part.state === 'output-available') {
                              return (
                                <React.Fragment key={`${message.id}-${index}`}>
                                  {part.toolName === 'roll-dice' ? (
                                    <React.Fragment>
                                      {/* @ts-expect-error TODO */}
                                      <Dice roll={part?.output?.content?.[0]?.text} />
                                    </React.Fragment>
                                  ) : (
                                    <div className="mx-[-0.75rem] my-2 rounded-lg bg-white p-3 text-sm font-semibold text-gray-500">
                                      {/* @ts-expect-error TODO */}
                                      Using <span className="font-extrabold">{part.output.title}</span> tool...
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            } else if (part.type === 'tool-generateImage' && part.state === 'output-available') {
                              return (
                                <React.Fragment key={`${message.id}-${index}`}>
                                  <AiImage
                                    // @ts-expect-error TODO
                                    base64={part.output.image}
                                    // @ts-expect-error TODO
                                    mediaType={part.output.mediaType}
                                    uint8Array={new Uint8Array([])}
                                    alt="Generated image"
                                    className="aspect-square h-[450px]"
                                  />
                                </React.Fragment>
                              );
                            }
                            // @ts-expect-error TODO
                            return <Response key={`${message.id}-${index}`}>{part.text}</Response>;
                          })}
                        </MessageContent>
                      </Message>
                    );
                  })}
                  {status === 'submitted' && (
                    <div className="flex items-center gap-2 p-4">
                      <Spinner variant="ring" className="text-gray-600" size={32} />
                      <span className="text-muted-foreground text-sm">Thinking...</span>
                    </div>
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            )}
            <PromptInput
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage({ text: input }, { body: { selectedModel } });
                setInput('');
              }}
              className="border-0 bg-white shadow-none"
            >
              <PromptInputTextarea
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                value={input}
                placeholder="Type your message..."
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputModelSelect onValueChange={setSelectedModel} value={selectedModel}>
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      {models.map((model) => (
                        <PromptInputModelSelectItem key={model.id} value={model.id}>
                          {model.name}
                        </PromptInputModelSelectItem>
                      ))}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!input} className="rounded-full" />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>
    </BubbleBackground>
  );
}
