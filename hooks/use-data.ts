import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";
import { useEffect } from "react";

interface DataStore {
    chats: string[];
    currentId: string | null;
    setChats: (chats: string[]) => void;
    setCurrentId: (id: string | null) => void;
    loadChats: () => Promise<void>;
}

const useDataStore = create<DataStore>((set) => ({
    chats: [],
    currentId: null,
    setChats: (chats) => set({ chats }),
    setCurrentId: (id) => {
        set({ currentId: id });
    },
    loadChats: async () => {
        const supabase = createClient();
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;
        const { data: chats } = await supabase.from('chat').select('id').eq('user_id', user.data.user.id);
        set({ chats: chats ? chats.map((chat) => chat.id) : [] });
    },
}));

export function useData() {
    const { chats, currentId, setChats, setCurrentId, loadChats } = useDataStore();

    useEffect(() => {
        loadChats();
    }, []);

    return { chats, setChats, currentId, setCurrentId, loadChats };
}
