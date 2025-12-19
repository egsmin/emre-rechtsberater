'use client';

import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat-input';
import { Input } from '@/components/ui/input';
import Chat from '@/components/chat';
import { useData } from '@/hooks/use-data';
import { createClient } from '@/lib/supabase/client';
import { UIMessage, useChat } from '@ai-sdk/react';
import { AlertCircle, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ChatPage() {


  const { currentId, setChats, chats } = useData();
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    if (!currentId) return;
    async function getMessages() {
      const supabase = createClient();
      const { data } = await supabase.from('chat').select('messages').eq('id', currentId).single();
      setInitialMessages(data?.messages ?? []);
    }
    getMessages();
  }, [currentId]);

  const stableMessages = useMemo(() => initialMessages, [initialMessages]);

  return (
    <div className="w-full h-full">
      <Chat initialMessages={stableMessages} initialId={currentId ?? crypto.randomUUID()} key={undefined}/>
    </div>
  );
}