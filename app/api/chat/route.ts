import { searchVectors } from "@/lib/rag";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages, id }: { messages: UIMessage[]; id: string } =
    await req.json();
  const supabase = await createClient();
  const modelMessages = convertToModelMessages(messages);

  let ragResult = null;
  if (
    modelMessages.length > 0 
  ) {
    ragResult = await searchVectors({
      query: modelMessages[modelMessages.length - 1].content.toString(),
      limit: 3,
      collectionName: 'global',
    });
  }

  if (ragResult) {
    modelMessages.push({
      role: 'system',
      content: `Die folgenden Informationen sind relevant für die Antwort auf die Frage des Users: ${modelMessages[modelMessages.length - 1].content.toString()}.
      ${ragResult.map((result: any) => result.payload?.text).join('\n')} Bitte beziehe dich bei deiner Antwort dennoch auf die Frage des Users. Schreibe keine unnötigen Informaitonen dazu. Die mitgelieferten Informationen sind aus einem RAG-Verfahren ermittelt worden und könnten demnach irrelevant sein.`
    });
  }

  const result = streamText({
    model: openai('o3-mini'),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: updatedMessages }) => {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) return;

      const user_id = user.data.user.id;

      const { error } = await supabase.from("chat").upsert({
        id,
        user_id,
        messages: updatedMessages,
      });

      if (error) {
        console.error("Failed to persist chat:", error);
      }
    },
  });
}
