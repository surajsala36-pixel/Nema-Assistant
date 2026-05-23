import React, { useEffect, useRef } from "react";
import { Trash2, MessageSquare, Mic, Play, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "user" | "nema";
  text: string;
}

interface ActivityFeedProps {
  messages: ChatMessage[];
  onClear: () => void;
  appState: "idle" | "listening" | "processing" | "speaking";
}

export default function ActivityFeed({ messages, onClear, appState }: ActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, appState]);

  return (
    <div className="w-full flex flex-col h-full pointer-events-auto overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <h3 className="text-xs font-mono font-medium tracking-widest text-white/40 uppercase flex items-center gap-1.5">
          <Terminal size={12} className="text-violet-400" />
          NEMA TELEMETRY LOG
        </h3>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] font-mono text-red-400/60 hover:text-red-400 hover:bg-red-500/10 px-2 py-0.5 rounded transition-all border border-red-500/10 flex items-center gap-1"
            title="Clear Feed History"
          >
            <Trash2 size={10} />
            CLEAR
          </button>
        )}
      </div>

      {/* Transcript Log Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1 py-1"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 border border-white/[0.03] border-dashed rounded-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center mb-3 text-white/20">
                <MessageSquare size={16} />
              </div>
              <p className="text-xs font-serif italic text-white/40">No conversations logged yet</p>
              <p className="text-[10px] font-mono mt-1 opacity-60">"Nema, wifi on karo" bol ke try kijiye!</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => {
              const isNema = msg.sender === "nema";
              return (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col gap-1 p-3 rounded-2xl border transition-all ${
                    isNema
                      ? "bg-violet-900/[0.08] border-violet-500/10 self-start text-left"
                      : "bg-cyan-950/[0.08] border-cyan-500/10 self-end text-left"
                  }`}
                >
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${
                      isNema 
                        ? "bg-violet-500/10 text-violet-400" 
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      {isNema ? "★ Nema (AI)" : "✎ Anmol Sir"}
                    </span>
                    <span className="text-[8px] font-mono text-white/30">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 font-sans tracking-wide">
                    {msg.text}
                  </p>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Dynamic status item at the bottom of the logs */}
        {appState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-2.5 rounded-xl border border-dashed flex items-center gap-2 text-[11px] font-mono animate-pulse ${
              appState === "listening"
                ? "border-violet-500/30 bg-violet-500/5 text-violet-300"
                : appState === "processing"
                ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-300"
                : "border-pink-500/30 bg-pink-500/5 text-pink-300"
            }`}
          >
            {appState === "listening" && (
              <>
                <Mic size={12} className="text-violet-400 animate-bounce" />
                <span>Nema is listening sir...</span>
              </>
            ) || appState === "processing" && (
              <>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Nema is thinking/samjhdar mode...</span>
              </>
            ) || appState === "speaking" && (
              <>
                <Play size={12} className="text-pink-400 fill-pink-400" />
                <span>Nema responding verbally...</span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
