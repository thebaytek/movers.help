"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyInviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — leave the code selectable in the UI.
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy invite code">
      {copied ? <Check className="w-4 h-4 text-[#76ff03]" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}
