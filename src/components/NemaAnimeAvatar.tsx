import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";
export type NemaMood = "loving" | "sassy" | "excited" | "thoughtful" | "sad" | "default";

interface NemaAnimeAvatarProps {
  state: VisualizerState;
  lastNemaText?: string;
}

// Empathy-driven mood detector for Hinglish context
function detectMood(text: string): NemaMood {
  if (!text) return "default";
  
  const lovingKeywords = [
    "pyaar", "pyar", "jaanu", "shona", "girlfriend", "gf", "sweetheart", "honey", "love", 
    "cute", "dil", "heart", "sunder", "loving", "handsome", "sir ji", "kumar", "tease", 
    "blush", "jaan", "babu", "darling", "pari", "beautiful", "sharm"
  ];
  
  const sassyKeywords = [
    "hat", "kamine", "shut up", "silly", "pagal", "gadhe", "bewaqoof", "drama", "roast", 
    "chup", "naukrani", "stupid", "lazy", "idiot", "nonsense", "gussa", "anger", "marugi", 
    "pitayi", "drama queen", "nakhre", "nakhrewali", "tej", "attitude"
  ];
  
  const excitedKeywords = [
    "haha", "hehe", "lol", "wow", "mazat", "funny", "party", "nacho", "hurray", "joy", 
    "happy", "excellent", "great", "kush", "khush", "perfect", "genius", "victory", 
    "badiya", "mast", "awesome", "celebrate", "dhamaka"
  ];
  
  const thoughtfulKeywords = [
    "code", "explain", "concept", "logic", "bns", "lawyer", "laws", "medical", "doctor", 
    "engineering", "study", "data", "formula", "calculate", "legal", "court", "ipc", 
    "science", "samjhdar", "mature"
  ];
  
  const sadKeywords = [
    "sad", "roona", "dard", "sorry", "maaf", "maafi", "emotional", "roiye", "dukh", 
    "breakup", "cry", "grief", "hurt", "bechara", "afsos", "parshan", "stress", "tension",
    "pareshan", "ro rahi"
  ];

  const lowerText = text.toLowerCase();
  
  for (const word of lovingKeywords) {
    if (lowerText.includes(word)) return "loving";
  }
  for (const word of sassyKeywords) {
    if (lowerText.includes(word)) return "sassy";
  }
  for (const word of excitedKeywords) {
    if (lowerText.includes(word)) return "excited";
  }
  for (const word of thoughtfulKeywords) {
    if (lowerText.includes(word)) return "thoughtful";
  }
  for (const word of sadKeywords) {
    if (lowerText.includes(word)) return "sad";
  }
  
  return "default";
}

export default function NemaAnimeAvatar({ state, lastNemaText }: NemaAnimeAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);
  const [mood, setMood] = useState<NemaMood>("default");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; scale: number; type: "heart" | "star" | "fire" | "tear" | "bulb" }[]>([]);

  // Smooth Mood Transition Handler
  useEffect(() => {
    if (state === "speaking" && lastNemaText) {
      setMood(detectMood(lastNemaText));
    } else if (state === "idle") {
      // Retain the sweet/quirky expression briefly after talking, then quiet down
      const t = setTimeout(() => {
        setMood("default");
      }, 5000);
      return () => clearTimeout(t);
    } else {
      setMood("default");
    }
  }, [lastNemaText, state]);

  // Automatic Natural Blinking Eyes
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3200 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Sync Mouth movement dynamics when speaking
  useEffect(() => {
    if (state !== "speaking") {
      setMouthOpenAmount(0);
      return;
    }

    const mouthInterval = setInterval(() => {
      setMouthOpenAmount(Math.random());
    }, 100);

    return () => clearInterval(mouthInterval);
  }, [state]);

  // Floating reactive particle generator matches the mood context!
  useEffect(() => {
    if (state === "idle" && mood === "default") {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      setSparkles((prev) => {
        const id = Date.now() + Math.random();
        // Determine particle type by conversation mood
        let pType: "heart" | "star" | "fire" | "tear" | "bulb" = "star";
        if (mood === "loving") {
          pType = "heart";
        } else if (mood === "sassy") {
          pType = "fire"; // sassy steam
        } else if (mood === "sad") {
          pType = "tear"; // tears or dynamic crying drop
        } else if (mood === "thoughtful") {
          pType = "bulb"; // idea gems
        } else if (mood === "excited") {
          pType = "star";
        }

        const newSparkle = {
          id,
          x: 50 + Math.random() * 300,
          y: 260 + Math.random() * 100,
          scale: 0.6 + Math.random() * 0.8,
          type: pType
        };
        return [...prev.slice(-15), newSparkle]; // Maximum 15 sparkles to maintain optimal performance
      });
    }, state === "speaking" ? 500 : 1200);

    return () => clearInterval(interval);
  }, [state, mood]);

  // Dynamic Avatar Pulse scales & rotations based on emotion/attitude
  const getAvatarScalePulse = () => {
    if (state === "listening") {
      return {
        scale: [1, 1.02, 1],
        y: [0, -4, 0],
        rotate: [0, 0.5, -0.5, 0],
        transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
      };
    }
    if (state === "processing") {
      return {
        scale: [1, 0.99, 1],
        y: [0, 2, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
      };
    }
    if (state === "speaking") {
      // Exciting dialogue bouncy physics
      if (mood === "excited") {
        return {
          scale: [1, 1.05, 0.96, 1.03, 1],
          y: [0, -12, 4, -6, 0],
          rotate: [0, 1.5, -1.5, 1, 0],
          transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" },
        };
      }
      if (mood === "sassy") {
        return {
          scale: [1, 1.02, 0.99, 1.01, 1],
          y: [0, -3, 2, 0],
          rotate: [0, -2, 2, -1, 0], // dramatic sassy head tilt
          transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
        };
      }
      if (mood === "sad") {
        return {
          scale: [1, 0.98, 1],
          y: [0, 3, 0],
          transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" },
        };
      }
      // General lovely soft talk flow
      return {
        scale: [1, 1.03, 0.98, 1.02, 1],
        y: [0, -6, 1, -3, 0],
        transition: { duration: 0.95, repeat: Infinity, ease: "easeInOut" },
      };
    }
    // Idle soft respiratory breathing
    return {
      scale: [1, 1.01, 1],
      y: [0, -2, 0],
      transition: { duration: 4.0, repeat: Infinity, ease: "easeInOut" },
    };
  };

  // Eyebrows customization per mood
  const getEyebrowPaths = () => {
    switch (mood) {
      case "sassy":
        return {
          left: "M 138 148 Q 158 141 174 150", 
          right: "M 226 138 Q 242 133 260 141" // Right side raised elegantly!
        };
      case "sad":
        return {
          left: "M 142 154 Q 158 146 174 152", // Down-curved sorrow look
          right: "M 226 152 Q 242 146 258 154"
        };
      case "excited":
        return {
          left: "M 140 145 Q 158 135 174 143", // Highly enthusiastic high-arches
          right: "M 226 143 Q 242 135 260 145"
        };
      case "loving":
        return {
          left: "M 142 149 Q 158 143 174 151",
          right: "M 226 151 Q 242 143 258 149"
        };
      default:
        return {
          left: "M 142 150 Q 158 140 174 148",
          right: "M 226 148 Q 242 140 258 150"
        };
    }
  };

  // Dynamic eye styling based on mood
  const renderLeftEye = () => {
    if (isBlinking) {
      return <path d="M 144 185 Q 160 195 176 185" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" />;
    }
    if (mood === "sad") {
      return (
        <g>
          <ellipse cx="160" cy="182" rx="15" ry="11" fill="url(#eyeGrad)" />
          <ellipse cx="160" cy="183" rx="8" ry="6" fill="#111827" />
          {/* Sorrow tear drop inside eye */}
          <circle cx="156" cy="177" r="5" fill="#ffffff" />
          <circle cx="164" cy="186" r="2.5" fill="#ffffff" />
          {/* Big tear bead dropping */}
          <motion.ellipse 
            animate={{ y: [0, 6, 12, 18], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn" }}
            cx="150" cy="188" rx="3.5" ry="5.5" fill="#67e8f9" 
          />
        </g>
      );
    }
    if (mood === "loving") {
      // Sweet heart-eyes or half closed bashful eyes
      return (
        <g>
          <ellipse cx="160" cy="180" rx="15" ry="12.5" fill="url(#eyeGrad)" />
          <ellipse cx="160" cy="181" rx="9" ry="7.5" fill="#111827" />
          {/* Heart shaped sparkle */}
          <path d="M 157 172 Q 160 169 163 172 Q 166 169 169 172 Q 169 175 163 181 Q 157 175 157 172 Z" fill="#fff1f2" />
          <circle cx="154" cy="183" r="2.5" fill="#ffffff" />
        </g>
      );
    }
    if (mood === "excited") {
      // Big stars inside eyes!
      return (
        <g>
          <ellipse cx="160" cy="180" rx="16" ry="13" fill="url(#eyeGrad)" />
          <ellipse cx="160" cy="181" rx="10" ry="8" fill="#111827" />
          {/* Star sparkle core */}
          <polygon points="160,170 162,174 167,175 163,178 164,183 160,181 156,183 157,178 153,175 158,174" fill="#ffffff" />
          <circle cx="165" cy="184" r="2" fill="#ffffff" />
        </g>
      );
    }
    // Default eye
    return (
      <g>
        <ellipse cx="160" cy="180" rx="15" ry="11.5" fill="url(#eyeGrad)" />
        <ellipse cx="160" cy="181" rx="8" ry="7" fill="#111827" />
        <circle cx="156" cy="174" r="4.5" fill="#ffffff" />
        <circle cx="165" cy="185" r="2.5" fill="#ffffff" />
      </g>
    );
  };

  const renderRightEye = () => {
    if (isBlinking) {
      return <path d="M 224 185 Q 240 195 256 185" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" />;
    }
    // Playful wink if sassy
    if (mood === "sassy" && state === "speaking") {
      return <path d="M 224 184 Q 240 174 256 182" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none" />;
    }
    if (mood === "sad") {
      return (
        <g>
          <ellipse cx="240" cy="182" rx="15" ry="11" fill="url(#eyeGrad)" />
          <ellipse cx="240" cy="183" rx="8" ry="6" fill="#111827" />
          <circle cx="236" cy="177" r="5" fill="#ffffff" />
          <circle cx="244" cy="186" r="2.5" fill="#ffffff" />
          <motion.ellipse 
            animate={{ y: [0, 6, 12, 18], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", delay: 0.9 }}
            cx="250" cy="188" rx="3.5" ry="5.5" fill="#67e8f9" 
          />
        </g>
      );
    }
    if (mood === "loving") {
      return (
        <g>
          <ellipse cx="240" cy="180" rx="15" ry="12.5" fill="url(#eyeGrad)" />
          <ellipse cx="240" cy="181" rx="9" ry="7.5" fill="#111827" />
          {/* Heart shaped sparkle */}
          <path d="M 237 172 Q 240 169 243 172 Q 246 169 249 172 Q 249 175 243 181 Q 237 175 237 172 Z" fill="#fff1f2" />
          <circle cx="234" cy="183" r="2.5" fill="#ffffff" />
        </g>
      );
    }
    if (mood === "excited") {
      return (
        <g>
          <ellipse cx="240" cy="180" rx="16" ry="13" fill="url(#eyeGrad)" />
          <ellipse cx="240" cy="181" rx="10" ry="8" fill="#111827" />
          <polygon points="240,170 242,174 247,175 243,178 244,183 240,181 236,183 237,178 233,175 238,174" fill="#ffffff" />
          <circle cx="245" cy="184" r="2" fill="#ffffff" />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx="240" cy="180" rx="15" ry="11.5" fill="url(#eyeGrad)" />
        <ellipse cx="240" cy="181" rx="8" ry="7" fill="#111827" />
        <circle cx="236" cy="174" r="4.5" fill="#ffffff" />
        <circle cx="245" cy="185" r="2.5" fill="#ffffff" />
      </g>
    );
  };

  const getBangsShift = () => {
    if (mood === "sassy") return { x: -3, rotate: -1 };
    if (mood === "excited") return { y: -2, x: 2 };
    return { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center select-none pointer-events-none">
      
      {/* Background Magic Circle Aura Custom Gradients per mood */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer rotating spell rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: mood === "excited" ? 14 : mood === "sassy" ? 18 : 28, repeat: Infinity, ease: "linear" }}
          className={`absolute w-[95%] h-[95%] rounded-full border border-dashed opacity-40 transition-colors duration-1000 ${
            mood === "loving" ? "border-pink-500" : mood === "sassy" ? "border-rose-500" : mood === "excited" ? "border-amber-400" : mood === "sad" ? "border-sky-400" : "border-pink-400/20"
          }`}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: mood === "excited" ? 10 : mood === "sassy" ? 12 : 20, repeat: Infinity, ease: "linear" }}
          className={`absolute w-[80%] h-[80%] rounded-full border border-dotted opacity-50 transition-colors duration-1000 ${
            mood === "loving" ? "border-fuchsia-400" : mood === "sassy" ? "border-red-400" : mood === "excited" ? "border-yellow-400" : mood === "sad" ? "border-blue-400" : "border-violet-400/30"
          }`}
        />
        
        {/* Dynamic Inner Aura Glow */}
        <div className={`absolute w-[68%] h-[68%] rounded-full blur-xl transition-all duration-1000 ${
          mood === "loving" 
            ? "bg-gradient-to-tr from-pink-500/20 via-pink-400/10 to-rose-400/15 scale-110 opacity-90" 
            : mood === "sassy" 
            ? "bg-gradient-to-tr from-rose-600/20 via-orange-500/10 to-pink-500/15 scale-115 opacity-90" 
            : mood === "excited" 
            ? "bg-gradient-to-tr from-yellow-500/20 via-amber-400/15 to-pink-500/20 scale-120 opacity-95" 
            : mood === "sad" 
            ? "bg-gradient-to-tr from-cyan-600/15 via-blue-500/10 to-indigo-500/10 scale-100 opacity-70"
            : mood === "thoughtful"
            ? "bg-gradient-to-tr from-cyan-500/20 via-purple-500/5 to-cyan-500/10 scale-105 opacity-80"
            : "bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-cyan-500/10 scale-100 opacity-55"
        }`} />
      </div>

      {/* Floating Sparkles & Mood elements */}
      <div className="absolute inset-0 z-25 overflow-hidden">
        <AnimatePresence>
          {sparkles.map((sp) => (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, y: sp.y, x: sp.x, scale: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: sp.y - 140, x: sp.x + (Math.random() * 50 - 25), scale: sp.scale }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: "easeOut" }}
              className="absolute pointer-events-none"
            >
              {sp.type === "heart" && (
                <svg className="w-6 h-6 text-pink-400/80 filter drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
              {sp.type === "star" && (
                <svg className="w-5 h-5 text-yellow-300/90 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] animation-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              )}
              {sp.type === "fire" && (
                <span className="text-rose-400/80 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] text-sm font-bold flex flex-col items-center">
                  💢
                </span>
              )}
              {sp.type === "tear" && (
                <svg className="w-4 h-5 text-cyan-300/80 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              )}
              {sp.type === "bulb" && (
                <span className="text-xl">✨</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Vector Anime Girl Avatar */}
      <motion.div
        animate={getAvatarScalePulse()}
        className="w-[90%] h-[90%] z-10 filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)]"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
          <defs>
            {/* Hair Color Gradients */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" /> {/* Pink */}
              <stop offset="60%" stopColor="#c084fc" /> {/* Purple */}
              <stop offset="100%" stopColor="#818cf8" /> {/* Indigo */}
            </linearGradient>

            <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Premium Skin Tone */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff1f2" />
              <stop offset="100%" stopColor="#ffe4e6" />
            </linearGradient>

            <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ffe4e6" stopOpacity="0" />
            </linearGradient>

            {/* Deep Violet Eyes */}
            <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="45%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#2e1065" />
            </linearGradient>
          </defs>

          {/* 1. Back hair flow layers */}
          <g>
            <path d="M 120 180 C 80 230 70 320 90 360 C 95 350 100 320 115 280 C 120 280 130 200 120 180 Z" fill="url(#hairGrad)" />
            <path d="M 280 180 C 320 230 330 320 310 360 C 305 350 300 320 285 280 C 280 280 270 200 280 180 Z" fill="url(#hairGrad)" />
            <path d="M 130 110 C 110 140 100 190 110 230 Q 120 190 140 170 Z" fill="url(#hairGrad)" opacity="0.9" />
            <path d="M 270 110 C 290 140 300 190 290 230 Q 280 190 260 170 Z" fill="url(#hairGrad)" opacity="0.9" />
          </g>

          {/* 2. Neck and body outfit dress clothing */}
          <g>
            <path d="M 175 230 Q 200 240 225 230 L 220 275 Q 200 285 180 275 Z" fill="url(#skinGrad)" />
            <path d="M 175 230 Q 200 248 225 230 Q 200 265 178 255 Z" fill="url(#skinShadow)" />

            <path d="M 120 380 Q 200 320 280 380 L 280 400 L 120 400 Z" fill="url(#dressGrad)" />
            <path d="M 165 290 L 190 335 L 200 305 L 210 335 L 235 290 L 200 274 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="2.5" />
            
            {/* Red bow decoration */}
            <path d="M 190 315 L 180 350 L 200 340 L 220 350 L 210 315 Z" fill="#f43f5e" />
            <circle cx="200" cy="315" r="5" fill="#fda4af" />
          </g>

          {/* 3. Face and rosy cheeks */}
          <g>
            <path d="M 134 160 C 130 215 155 264 200 264 C 245 264 270 215 266 160 C 265 125 135 124 134 160 Z" fill="url(#skinGrad)" />
            <path d="M 134 175 C 122 175 120 195 130 205 Z" fill="url(#skinGrad)" />
            <path d="M 266 175 C 278 175 280 195 270 205 Z" fill="url(#skinGrad)" />

            {/* Interactive Blush system */}
            <g opacity={
              mood === "loving" ? 0.95 : mood === "sassy" ? 0.75 : mood === "excited" ? 0.85 : mood === "sad" ? 0.2 : 0.45
            }>
              <g stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round">
                <line x1="151" y1="205" x2="156" y2="197" />
                <line x1="156" y1="205" x2="161" y2="197" />
                <line x1="161" y1="205" x2="166" y2="197" />

                <line x1="234" y1="205" x2="239" y2="197" />
                <line x1="239" y1="205" x2="244" y2="197" />
                <line x1="244" y1="205" x2="249" y2="197" />
              </g>
              {/* Extra romantic hot rose cheeks glow */}
              <circle cx="159" cy="203" r="14" fill="#fda4af" opacity="0.6" filter="blur(1px)" />
              <circle cx="241" cy="203" r="14" fill="#fda4af" opacity="0.6" filter="blur(1px)" />

              {mood === "loving" && (
                <>
                  {/* Hearts on cheeks */}
                  <path d="M 144 206 Q 146 203 148 206 Q 150 203 152 206 Q 152 208 148 212 Q 144 208 144 206 Z" fill="#ff2e93" />
                  <path d="M 252 206 Q 254 203 256 206 Q 258 203 260 206 Q 260 208 256 212 Q 252 208 252 206 Z" fill="#ff2e93" />
                </>
              )}
            </g>
          </g>

          {/* 4. Interactive Eyelid / Eyelash / Eyeball Layers */}
          <g>
            {/* Custom responsive Eyebrow shapes */}
            <path d={getEyebrowPaths().left} stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d={getEyebrowPaths().right} stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* White background eyeball contour */}
            <ellipse cx="160" cy="180" rx="16" ry="12" fill="#ffffff" stroke="#1e1b4b" strokeWidth="0.5" />
            <ellipse cx="240" cy="180" rx="16" ry="12" fill="#ffffff" stroke="#1e1b4b" strokeWidth="0.5" />

            {/* Irises */}
            {renderLeftEye()}
            {renderRightEye()}

            {/* Thick top eyelashes outline */}
            <path d="M 142 178 Q 160 166 178 178" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 174 172 L 180 166" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />

            {mood !== "sassy" || state !== "speaking" ? (
              <>
                <path d="M 222 178 Q 240 166 258 178" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 226 172 L 220 166" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : null}
          </g>

          {/* 5. Cute nose */}
          <g>
            <path d="M 198 198 L 200 204 L 203 203" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
          </g>

          {/* 6. Advanced Talking Mouth matching the specific emotion! */}
          <g>
            {state === "speaking" ? (
              mood === "loving" ? (
                // Sweet loving smile sound
                <path 
                  d={`M 188 226 Q 200 ${226 + 13 * mouthOpenAmount} 212 226 Q 200 ${226 - 6 * mouthOpenAmount} 188 226`} 
                  fill="#f43f5e" 
                  stroke="#9f1239" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              ) : mood === "sassy" ? (
                // Smug side talk
                <path 
                  d={`M 189 225 Q 198 ${225 + 15 * mouthOpenAmount} 211 223 C 201 ${225 - 11 * mouthOpenAmount} 195 224 189 225`} 
                  fill="#ec4899" 
                  stroke="#9f1239" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              ) : mood === "excited" ? (
                // Grand joyful wide happy mouth (showing little cute tongue!)
                <g>
                  <path 
                    d={`M 186 225 Q 200 ${226 + 25 * mouthOpenAmount} 214 225 Q 200 ${226 - 15 * mouthOpenAmount} 186 225`} 
                    fill="#fda4af" 
                    stroke="#9f1239" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round" 
                  />
                  {mouthOpenAmount > 0.4 && (
                    <path d="M 192 233 Q 200 225 208 233 Q 200 242 192 233" fill="#ec4899" opacity="0.9" />
                  )}
                </g>
              ) : mood === "sad" ? (
                // Downward crying talk
                <path 
                  d={`M 188 229 Q 200 ${229 - 7 * mouthOpenAmount} 212 229 Q 200 ${229 + 13 * mouthOpenAmount} 188 229`} 
                  fill="#fecdd3" 
                  stroke="#9f1239" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              ) : (
                // Standard default talking mouth
                <path 
                  d={`M 188 226 Q 200 ${226 + 18 * mouthOpenAmount} 212 226 Q 200 ${226 - 15 * mouthOpenAmount} 188 226`} 
                  fill="#fda4af" 
                  stroke="#9f1239" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              )
            ) : (
              // Idle state mouth variations matching Nema's signature personality vibes
              state === "listening" ? (
                <circle cx="200" cy="226" r="5.5" fill="#fda4af" stroke="#9f1239" strokeWidth="2" />
              ) : state === "processing" ? (
                <path d="M 192 228 C 195 224 200 231 205 226" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              ) : (
                mood === "loving" ? (
                  // Cat smile face :3
                  <path d="M 191 224 Q 196 229 200 225 Q 204 229 209 224" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                ) : mood === "sassy" ? (
                  // Smrk
                  <path d="M 192 224 Q 203 220 211 227" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                ) : mood === "excited" ? (
                  // Tiny cute fang showing smile!
                  <g>
                    <path d="M 188 224 Q 200 234 212 224 Z" fill="#fda4af" stroke="#1e1b4b" strokeWidth="2" />
                    <polygon points="193,224 196,228 198,224" fill="#ffffff" />
                    <polygon points="207,224 204,228 202,224" fill="#ffffff" />
                  </g>
                ) : mood === "sad" ? (
                  // Downward frown
                  <path d="M 190 230 Q 200 222 210 230" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                ) : (
                  // Default tiny sweet smile
                  <path d="M 191 225 Q 200 229 209 225" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                )
              )
            )}
          </g>

          {/* 7. Beautiful Framing hair & Bangs shifts dynamically */}
          <motion.g animate={getBangsShift()} transition={{ duration: 0.8 }}>
            <path d="M 130 135 C 130 90 270 90 270 135 C 285 145 285 175 280 190 Q 255 170 268 150 Q 200 130 132 150 C 120 165 115 145 130 135 Z" fill="url(#hairGrad)" />
            
            <path d="M 132 145 C 130 180 142 210 145 225 C 147 210 142 165 148 150 Z" fill="url(#hairGrad)" />
            <path d="M 148 140 C 150 170 165 200 175 210 C 172 195 165 170 168 140 Z" fill="url(#hairGrad)" />
            <path d="M 188 135 C 190 160 198 185 204 185 C 206 175 200 155 204 135 Z" fill="url(#hairGrad)" />
            <path d="M 224 135 C 220 160 225 190 238 208 C 235 190 228 165 232 138 Z" fill="url(#hairGrad)" />
            <path d="M 252 140 C 255 170 258 190 264 220 C 263 195 258 170 258 145 Z" fill="url(#hairGrad)" />

            {/* Glossy halo highlight */}
            <path d="M 150 120 Q 200 108 250 120 Q 200 114 150 120 Z" fill="url(#hairHighlight)" />

            {/* Twin hair clips and ribbons */}
            <rect x="124" y="115" width="12" height="12" rx="3" fill="#ec4899" transform="rotate(-15 124 115)" />
            <path d="M 120 120 L 110 135 L 122 130 L 126 142 L 128 122 Z" fill="#ec4899" />
            
            <rect x="264" y="115" width="12" height="12" rx="3" fill="#ec4899" transform="rotate(15 264 115)" />
            <path d="M 280 120 L 290 135 L 278 130 L 274 142 L 272 122 Z" fill="#ec4899" />
          </motion.g>
        </svg>

        {/* Reactive Dialogue Bubbles & Badges on the Avatar Canvas */}
        <AnimatePresence>
          {state === "speaking" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -15 }}
              className={`absolute -top-3 -right-6 px-3 py-1.5 rounded-2xl rounded-tr-none text-[10px] text-white font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 bg-gradient-to-r transition-all duration-500 ${
                mood === "loving" 
                  ? "from-pink-500 to-rose-500 shadow-pink-500/30" 
                  : mood === "sassy" 
                  ? "from-rose-600 to-orange-500 shadow-rose-500/35"
                  : mood === "excited"
                  ? "from-yellow-500 to-pink-500 shadow-yellow-500/30 text-indigo-950"
                  : mood === "sad"
                  ? "from-cyan-500 to-blue-500 shadow-blue-500/30"
                  : "from-pink-500 to-rose-500 shadow-pink-500/30"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {mood === "loving" && "Nema Jaanu Sweetly~"}
              {mood === "sassy" && "Nema Nakhrewali Roasting~"}
              {mood === "excited" && "Nema Shona Excitingly~"}
              {mood === "sad" && "Nema Emotional Vibe~"}
              {mood === "thoughtful" && "Nema Samjhdar Mood~"}
              {mood === "default" && "Nema Jaanu Speaking~"}
            </motion.div>
          )}

          {state === "listening" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -15 }}
              className="absolute -top-3 -left-6 px-3 py-1.5 rounded-2xl rounded-tl-none bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[10px] text-white font-mono font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(139,92,246,0.4)] flex items-center gap-1.5"
            >
              <div className="flex gap-0.5">
                <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              Boliye Anmol Sir Ji~
            </motion.div>
          )}

          {state === "processing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -15 }}
              className="absolute -top-3 left-[35%] px-3 py-1 bg-[#1e1b4b] border border-pink-400/40 text-[9px] text-pink-300 font-mono tracking-widest uppercase rounded-lg shadow-lg flex items-center gap-1"
            >
              <span className="animate-pulse">Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
