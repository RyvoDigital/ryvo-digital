"use client";

import { useEffect } from "react";
import type { Dictionary } from "@/i18n";
import ChatThread, { useChatPlayer, type Who } from "@/components/chrome/ChatThread";

// The chat on the phone screen plays in, in the page's language, like iMessage
// (ChatThread): every bubble keeps its place from the first paint, so nothing on
// the page moves while it plays (CLS stays at zero).
const WHOS: Who[] = ["lead", "agent", "lead", "agent"];

export default function HeroChat({ chat, onBooked }: { chat: Dictionary["hero"]["chat"]; onBooked?: () => void }) {
  const { state, play } = useChatPlayer(WHOS, { onDone: onBooked });
  useEffect(() => { play(700); }, [play]);

  const items = [chat.l1, chat.a1, chat.l2, chat.a2].map((content, i) => ({ who: WHOS[i], content }));

  return (
    <div className="hero-chat relative flex h-full flex-col text-text" style={{ fontSize: 12.6 }}>
      <div className="flex items-center gap-[0.8em] border-b border-surface-2/80 px-[1.2em] pb-[0.85em] pt-[3.9em]">
        <span className="flex h-[2.7em] w-[2.7em] items-center justify-center rounded-full bg-surface-2 text-[0.85em] font-semibold text-silver">YA</span>
        <span className="flex flex-col leading-tight">
          <span className="text-[1.05em] font-semibold">{chat.agency}</span>
          <span className="text-[0.82em] text-steel">{chat.status}</span>
        </span>
      </div>
      <div className="px-[0.95em] py-[1em] leading-[1.42]" aria-live="off" style={{ ["--chat-gap" as string]: "0.65em" }}>
        <ChatThread
          items={items}
          state={state}
          head={<span className="font-mono text-[0.78em] text-steel">{chat.stamp}</span>}
          deliveredLabel={chat.delivered}
          classes={{
            lead: "max-w-[80%] rounded-[1.1em_1.1em_0.3em_1.1em] bg-[#ECEEF1] px-[0.85em] py-[0.7em] text-obsidian",
            agent: "max-w-[86%] rounded-[1.1em_1.1em_1.1em_0.3em] bg-surface-2 px-[0.85em] py-[0.7em]",
          }}
        />
      </div>
      <noscript>
        <style>{`.hero-chat [data-on]{opacity:1!important;transform:none!important}.hero-chat [data-typing],.hero-chat [data-delivered]{display:none}`}</style>
      </noscript>
    </div>
  );
}
