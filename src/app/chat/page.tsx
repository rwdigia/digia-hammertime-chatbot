'use client';

import { useChat } from '@ai-sdk/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ui/shadcn-io/ai/conversation';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/shadcn-io/ai/message';
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

  const renderParts = (part: any) => {
    switch (part.type) {
      case 'dynamic-tool': {
        return `**Tool:** ${part.toolName}
        ${part.state === 'output-available' && JSON.stringify(part.output, null, 2)}`;
      }
      case 'text': {
        return part.text;
      }
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-slate-50">
      <Image className="absolute top-5 left-5" src="/digia-logo.svg" alt="Digia logo" width={85} height={34} />
      <Button className="absolute top-5 right-5" variant="outline" onClick={() => signOut({ redirectTo: '/' })}>
        Sign Out
      </Button>
      <div>
        <Conversation className="mb-4 h-[600px] w-[900px] rounded-2xl border border-slate-100 bg-white">
          <ConversationContent>
            {messages.map((message) => {
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts?.map((part, index) => {
                      // if (part.type === 'dynamic-tool' && part.toolName === 'roll-dice') {
                      //   return <Dice number={parseInt(part.text) || 1} key={`${message.id}-${index}`} />;
                      // }
                      return <Response key={`${message.id}-${index}`}>{renderParts(part)}</Response>;
                    })}
                  </MessageContent>
                  <MessageAvatar
                    src={message.role === 'user' ? 'https://github.com/shadcn.png' : 'https://github.com/openai.png'}
                  />
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
