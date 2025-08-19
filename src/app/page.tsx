'use client';

import { useChat } from '@ai-sdk/react';
import { Bot } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
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

const models = [{ id: 'gpt-5-chat', name: 'OpenAI GPT-5 Chat' }];

export default function HomePage() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);

  return (
    <Drawer>
      <div className="flex h-screen w-full items-center justify-center">
        <DrawerTrigger>
          <div className="flex items-center justify-center">
            <Bot size={20} />
            <div className="ml-2">Chatbot</div>
          </div>
        </DrawerTrigger>
      </div>
      <DrawerContent className="!h-[600px]">
        <div className="mx-auto w-2xl">
          <DrawerHeader>
            <DrawerTitle>
              <div className="flex w-full items-center justify-center">
                <Bot size={20} className="mr-2" />
                Chatbot
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <Conversation className="relative size-full rounded-2xl bg-slate-50" style={{ height: '380px' }}>
            <ConversationContent>
              {messages.map((message, index) =>
                message.parts.map((part, partIndex) => {
                  console.log(part);
                  if (part.type === 'text' || part.type === 'dynamic-tool') {
                    return (
                      <Message from={index % 2 === 0 ? 'user' : 'assistant'} key={message.id}>
                        <React.Fragment key={`${message.id}-${partIndex}`}>
                          <MessageContent>
                            {part.type === 'dynamic-tool' && part.toolName === 'get-task' ? (
                              <div>
                                <p className="font-bold">{(part as any).output?.structuredContent.title}</p>
                                <p>{(part as any).output?.structuredContent.description}</p>
                                <Link
                                  className="underline"
                                  href={`/?taskId=${(part as any).output?.structuredContent.id}`}
                                >
                                  View Task
                                </Link>
                              </div>
                            ) : part.type === 'text' ? (
                              (part as any).text
                            ) : null}
                          </MessageContent>
                          <MessageAvatar
                            src={index % 2 === 0 ? 'https://github.com/shadcn.png' : 'https://github.com/openai.png'}
                          />
                        </React.Fragment>
                      </Message>
                    );
                  }
                }),
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="fixed bottom-[20px] mx-auto w-2xl">
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
      </DrawerContent>
    </Drawer>
  );
}
