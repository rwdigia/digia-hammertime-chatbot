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

const models = [{ id: 'gpt-5-chat', name: 'OpenAI GPT-5 Chat' }];

export default function Page() {
  const session = useSession();

  if (!session) {
    redirect('/');
  }

  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);

  return (
    <>
      <div className="w-[calc(100vw - 40px)] m-5 flex items-center justify-between rounded-full bg-gray-100 px-6 py-4">
        <Image src="/digia-logo.svg" alt="Digia logo" width={85} height={34} priority />
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
      <div className="flex h-[calc(100vh-106px)] flex-col items-center justify-center">
        <div className="w-full max-w-[900px]">
          <Conversation className="mb-4 h-[600px] rounded-2xl border border-gray-100 bg-white">
            <ConversationContent>
              {messages.map((message: UIMessage) => {
                return (
                  <Message key={message.id} from={message.role}>
                    <MessageContent className="px-5 py-4 group-[.is-assistant]:bg-gray-50 group-[.is-assistant]:text-gray-600 group-[.is-user]:bg-gray-50 group-[.is-user]:text-gray-600">
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
                        }
                        return (
                          <Response key={`${message.id}-${index}`}>
                            {/* @ts-expect-error TODO */}
                            {part.text}
                          </Response>
                        );
                      })}
                    </MessageContent>
                  </Message>
                );
              })}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <PromptInput
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput('');
            }}
            className="bg-white shadow-none"
          >
            <PromptInputTextarea
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              value={input}
              placeholder="Type your message..."
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputModelSelect onValueChange={setModel} value={model}>
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
    </>
  );
}
