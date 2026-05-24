import { motion } from "motion/react";
import { Compass, Wind, WifiOff } from "lucide-react";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  deviceState?: {
    wifi: boolean;
    flashlight: boolean;
    bluetooth: boolean;
    location: boolean;
    dnd: boolean;
    powerSaver: boolean;
    phoneHotspot: boolean;
    phoneData: boolean;
    phoneMirroring: boolean;
    phoneLock: boolean;
    phoneSilent: boolean;
    laptopBacklight: boolean;
    laptopScreenLock: boolean;
    laptopTurbo: boolean;
    laptopFanMax: boolean;
    laptopExternalDisplay: boolean;
  };
}

export default function Visualizer({ state, deviceState }: VisualizerProps) {
  const getRingAnimation = (index: number, reverse: boolean = false) => {
    let baseSpeed = state === "listening" ? 3 : state === "processing" ? 1.5 : state === "speaking" ? 2 : 15;
    
    // Turbo Boost spins much faster
    if (deviceState?.laptopTurbo) {
      baseSpeed = baseSpeed / 2.2;
    }
    // Power saver runs animations slower
    if (deviceState?.powerSaver) {
      baseSpeed = baseSpeed * 1.6;
    }

    return {
      rotate: reverse ? [-360, 0] : [0, 360],
      transition: { duration: Math.max(0.4, baseSpeed + index * 2.5), repeat: Infinity, ease: "linear" }
    };
  };

  const getPulseAnimation = () => {
    let durationMultiplier = 1;
    if (deviceState?.laptopTurbo) durationMultiplier = 0.6;
    if (deviceState?.powerSaver) durationMultiplier = 1.6;

    if (state === "speaking") {
      return {
        scale: [1, 1.06, 0.97, 1.03, 1],
        opacity: [0.8, 1, 0.8, 1, 0.8],
        transition: { duration: 0.5 * durationMultiplier, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "listening") {
      return {
        scale: [1, 1.03, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 1.0 * durationMultiplier, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "processing") {
      return {
        scale: [0.97, 1.03, 0.97],
        opacity: [0.6, 0.9, 0.6],
        transition: { duration: 0.8 * durationMultiplier, repeat: Infinity, ease: "linear" }
      };
    }
    return {
      scale: [1, 1.01, 1],
      opacity: [0.35, 0.55, 0.35],
      transition: { duration: 4.0 * durationMultiplier, repeat: Infinity, ease: "easeInOut" }
    };
  };

  // JARVIS color palette (Cyan/Blue) with Nema's personality (Violet/Pink hints)
  const getTheme = () => {
    // If WiFi is disabled, show offline state
    if (deviceState && !deviceState.wifi) {
      return { 
        color: "rgba(100, 116, 139, 0.4)", 
        glow: "shadow-slate-500/40", 
        border: "border-slate-500/40" 
      };
    }

    // Power saver dims color slightly to green eco theme
    if (deviceState?.powerSaver) {
      switch (state) {
        case "listening": return { color: "rgba(16, 185, 129, 0.9)", glow: "shadow-emerald-500/50", border: "border-emerald-400/80" };
        case "processing": return { color: "rgba(52, 211, 153, 0.9)", glow: "shadow-emerald-400/70", border: "border-emerald-300/80" };
        case "speaking": return { color: "rgba(16, 185, 129, 0.9)", glow: "shadow-emerald-500/60", border: "border-emerald-400/80" };
        default: return { color: "rgba(5, 150, 105, 0.7)", glow: "shadow-emerald-600/30", border: "border-emerald-600/40" };
      }
    }

    switch (state) {
      case "listening": return { color: "rgba(139, 92, 246, 1)", glow: "shadow-violet-500/60", border: "border-violet-400" };
      case "processing": return { color: "rgba(56, 189, 248, 1)", glow: "shadow-sky-400/80", border: "border-sky-400" };
      case "speaking": return { color: "rgba(236, 72, 153, 1)", glow: "shadow-pink-500/80", border: "border-pink-400" };
      default: return { color: "rgba(6, 182, 212, 0.8)", glow: "shadow-cyan-500/40", border: "border-cyan-500/50" }; // Cyan for idle
    }
  };

  const theme = getTheme();

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Ambient Glow */}
      <motion.div
        animate={getPulseAnimation()}
        className={`absolute w-[60%] h-[60%] rounded-full blur-[80px] ${theme.glow}`}
        style={{ backgroundColor: theme.color, opacity: deviceState?.powerSaver ? 0.08 : 0.15 }}
      />

      {/* Ring 1: Massive Outer Dashed */}
      <motion.div
        animate={getRingAnimation(4, false)}
        className={`absolute w-[100%] h-[100%] rounded-full border-[1px] border-dashed ${theme.border} opacity-20`}
      />

      {/* Ring 2: Segmented Thick Ring */}
      <motion.div
        animate={getRingAnimation(3, true)}
        className={`absolute w-[85%] h-[85%] rounded-full border-[2px] border-dotted ${theme.border} opacity-30`}
      />

      {/* Ring 3: Scanner Ring (Solid with gaps) */}
      <motion.div
        animate={getRingAnimation(2, false)}
        className={`absolute w-[70%] h-[70%] rounded-full border-[1px] ${theme.border} border-t-transparent border-b-transparent opacity-40`}
      />

      {/* Ring 4: Inner Dashed */}
      <motion.div
        animate={getRingAnimation(1, true)}
        className={`absolute w-[55%] h-[55%] rounded-full border-[2px] border-dashed ${theme.border} opacity-50`}
      />
      
      {/* Ring 5: Core HUD Ring */}
      <motion.div
        animate={getRingAnimation(0, false)}
        className={`absolute w-[40%] h-[40%] rounded-full border-[4px] border-dotted ${theme.border} opacity-70`}
      />

      {/* Core Circle */}
      <motion.div
        animate={getPulseAnimation()}
        className={`absolute w-[25%] h-[25%] rounded-full border-[1px] ${theme.border} bg-black/40 backdrop-blur-md flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]`}
        style={{ boxShadow: `0 0 40px ${theme.color}, inset 0 0 30px ${theme.color}` }}
      >
        {/* Fan Overdrive Fan Animation behind core text */}
        {deviceState?.laptopFanMax && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-teal-500/20 w-[90%] h-[90%] flex items-center justify-center pointer-events-none"
          >
            <Wind size={28} className="text-teal-400/20 absolute" />
            <Wind size={28} className="text-teal-400/20 absolute rotate-90" />
            <Wind size={28} className="text-teal-400/20 absolute rotate-180" />
          </motion.div>
        )}

        {/* Location GPS Radar sweeps */}
        {deviceState?.location && (
          <motion.div 
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute border border-rose-500/20 w-[80%] h-[80%] rounded-full flex items-center justify-center pointer-events-none"
          >
            <Compass size={20} className="text-rose-400/10" />
          </motion.div>
        )}

        {/* Bluetooth Pairing Waves */}
        {deviceState?.bluetooth && (
          <div className="absolute w-[95%] h-[95%] border border-sky-400/5 rounded-full" />
        )}

        {/* WiFi Off Crossed Indicator inside Core */}
        {deviceState && !deviceState.wifi && (
          <WifiOff size={14} className="text-slate-400/40 absolute top-4 animate-bounce" />
        )}

        {/* Center Text */}
        <div 
          className="font-bold tracking-[0.3em] text-xl md:text-3xl lg:text-4xl text-white z-10"
          style={{ textShadow: `0 0 15px ${theme.color}, 0 0 30px ${theme.color}` }}
        >
          NEMA
        </div>

        {/* Dynamic Telemetry Status badge inside Core */}
        <span className="text-[8px] font-mono opacity-50 tracking-wider uppercase mt-1 z-10">
          {deviceState && !deviceState.wifi ? (
            <span className="text-slate-400">Offline</span>
          ) : deviceState?.powerSaver ? (
            <span className="text-emerald-400">ECO Mode</span>
          ) : deviceState?.laptopTurbo ? (
            <span className="text-rose-500">Overclock</span>
          ) : (
            <span className="text-cyan-400">{state}</span>
          )}
        </span>
      </motion.div>
    </div>
  );
}
