'use client';

import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
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

export default function HomePage() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div>
        <Conversation className="mb-4 h-[600px] w-[900px] rounded-2xl border border-slate-100">
          <ConversationContent>
            {messages.map((message, index) =>
              message.parts.map((part, partIndex) => {
                if (part.type === 'text') {
                  return (
                    <Message from={index % 2 === 0 ? 'user' : 'assistant'} key={message.id}>
                      <React.Fragment key={`${message.id}-${partIndex}`}>
                        <MessageContent>
                          <Response key={`${message.id}-${partIndex}`}>{part.text}</Response>
                        </MessageContent>
                        <MessageAvatar
                          src={index % 2 === 0 ? 'https://github.com/shadcn.png' : 'https://github.com/openai.png'}
                        />
                      </React.Fragment>
                    </Message>
                  );
                }
                return null;
              }),
            )}
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
