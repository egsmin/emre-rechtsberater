"use client";

import { UIMessage } from "ai";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./ui/chat-input";
import { createClient } from "@/lib/supabase/client";

export default function Chat({ initialMessages, initialId }: { initialMessages: UIMessage[], initialId: string | undefined }) {

    const { messages, sendMessage, status, id, setMessages } = useChat({
        id: initialId ?? undefined,
    });
    const ref = useRef<HTMLDivElement>(null)
    const [closeWarning, setCloseWarning] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [input, setInput] = useState('');
    

    useEffect(() => {
        async function checkIsLoggedIn() {
            const supabase = createClient();
            const { data } = await supabase.auth.getClaims();
            setIsLoggedIn(data?.claims ? true : false);
        }
        checkIsLoggedIn();
    }, []);

    useEffect(() => {
        if (initialId && initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, [initialId, initialMessages, setMessages]);
    
    
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    
    return (
        <div className="flex flex-col w-full h-full mx-auto py-8 px-8 items-center justify-between">
            <div className="flex flex-col overflow-y-scroll space-y-8 mb-8 scrollbar-hide w-full h-full stretch">

                {messages.length === 0 && !isLoggedIn && !closeWarning &&
                    <div className="flex flex-row items-center justify-between gap-2 border border-orange-300 rounded-lg p-2">
                        <div className="flex flex-row items-center gap-2">
                            <AlertCircle className="size-4 text-orange-500" />
                            <p className="text-orange-500">Ihr Chat wird nicht gespeichert, da Sie nicht eingeloggt sind.</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setCloseWarning(true)}>
                            <X className="size-4 text-orange-500" />
                        </Button>
                    </div>
                }
                {messages.map(message => (
                    <div key={message.id} className={`whitespace-pre-wrap max-w-[80%] ${message.role === 'user' ? 'self-end' : 'self-start'} ${message.role === 'user' && 'bg-green-100 text-black dark:bg-green-900 dark:text-white dark:text-opacity-80 rounded-lg p-2'} text-lg`}>
                        {message.parts.map((part, i) => {
                            switch (part.type) {
                                case 'text':
                                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                                default:
                                    return null;
                            }
                        })}
                    </div>
                ))}
                {status === 'submitted' && <div>Ihre Antwort wird generiert...</div>}
                <div ref={ref} />
            </div>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (input.trim() === '') return;
                    sendMessage({ text: input });
                    setInput('');
                }}
                className=" w-full items-center justify-center gap-2 max-w-[80%]"
            >
                <ChatInput
                    onSubmit={(value) => {
                        if (value.trim() === '') return;
                        sendMessage({ text: value });
                        setInput('');
                    }}
                    value={input}
                    placeholder="Fragen Sie mich etwas..."
                    onChange={e => setInput(e.currentTarget.value)}
                    className="w-full shadow-sm shadow-black/50 rounded-lg dark:shadow-white/50 "
                />
            </form>
        </div>

    );
}