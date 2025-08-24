'use client';

import { UIMessage, useChat } from '@ai-sdk/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
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
    <div className="relative flex h-screen flex-col items-center justify-center bg-slate-50">
      <Image className="absolute top-5 left-5" src="/digia-logo.svg" alt="Digia logo" width={85} height={34} priority />
      <Button className="absolute top-5 right-5" variant="outline" onClick={() => signOut({ redirectTo: '/' })}>
        Sign Out
      </Button>
      <div className="w-full max-w-[900px] p-4">
        <Conversation className="mb-4 h-[600px] rounded-2xl border border-slate-100 bg-white">
          <ConversationContent>
            {messages.map((message: UIMessage) => {
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent className="group-[.is-assistant]:bg-slate-50 group-[.is-assistant]:text-slate-600 group-[.is-user]:bg-slate-50 group-[.is-user]:text-slate-600">
                    {message.parts?.map((part, index) => {
                      if (part.type === 'dynamic-tool' && part.state === 'output-available') {
                        if (part.toolName === 'roll-dice') {
                          return (
                            <React.Fragment key={`${message.id}-${index}`}>
                              {/* @ts-expect-error TODO */}
                              <Dice roll={part?.output?.content?.[0]?.text} />
                            </React.Fragment>
                          );
                        } else {
                          return (
                            <div
                              className="mb-1 border-b border-b-slate-400 pb-1 text-sm text-slate-500"
                              key={`${message.id}-${index}`}
                            >
                              {/* @ts-expect-error TODO */}
                              {part.output.title}
                            </div>
                          );
                        }
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
            <PromptInputSubmit disabled={!input} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
