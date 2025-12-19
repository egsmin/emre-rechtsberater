
import { AuthButton } from "./auth-button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ActionBar } from "./action-bar";

export default async function Topbar({ className }: { className?: string }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = data?.claims;
  return (
    <div className={cn("relative flex items-center justify-between w-full p-4 bg-black/50 dark:bg-black/50 backdrop-blur-lg rounded-lg", className)}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 font-medium text-2xl">
        Rechtsberatung
      </div>
      <ActionBar />
      <div className="ml-auto">
        <AuthButton />
      </div>
    </div>
  );
}