import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useId } from "react";

function ChatInput(
    { onSubmit, value, onChange, placeholder, className }: { onSubmit: (value: string) => void, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, className?: string }
) {
  const id = useId();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <div className={cn("space-y-2 min-w-[300px]", className)}>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      <Button variant="outline" className="w-full" onClick={() => onSubmit(value)}>
        Send
      </Button>
    </div>
  );
}

export { ChatInput };
