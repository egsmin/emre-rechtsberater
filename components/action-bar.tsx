"use client";

import { File, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui/menubar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/hooks/use-data";
import { useRouter } from "next/navigation";

export function ActionBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { chats, setChats, setCurrentId } = useData();
    const router = useRouter();
    useEffect(() => {
        async function checkIsLoggedIn() {
            const supabase = createClient();
            const { data } = await supabase.auth.getClaims();
            setIsLoggedIn(data?.claims ? true : false);
        }
        checkIsLoggedIn();
    }, []);

    return (
        isLoggedIn && <div className="flex flex-row items-center gap-2">
            <Menubar>
            <MenubarMenu>
                <MenubarTrigger>
                    Chats
                </MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={() => {
                        setCurrentId(null);
                        router.push('/');
                    }}>
                        Neu
                    </MenubarItem>
                    {chats.map((chat) => (
                        <MenubarItem key={chat} onClick={() => {
                            setCurrentId(chat);
                            router.push('/')
                        }}>
                            {chat}
                        </MenubarItem>
                    ))}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
        <Button variant="outline" size="icon" onClick={() => {
            router.push('/rag');
        }}>
            RAG
        </Button>
        </div>
    );
}