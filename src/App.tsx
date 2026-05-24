import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, Compass, Terminal, User, Lock, Smartphone, Battery, BatteryCharging } from "lucide-react";
import { getNemaResponse, getNemaAudio, resetNemaSession } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import NemaAnimeAvatar from "./components/NemaAnimeAvatar";
import ControlCenter, { DeviceState } from "./components/ControlCenter";
import ActivityFeed from "./components/ActivityFeed";
import { playPCM } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";

type AppState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "nema";
  text: string;
  username?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [deviceState, setDeviceState] = useState<DeviceState>({
    wifi: true,
    flashlight: false,
    bluetooth: true,
    location: true,
    dnd: false,
    powerSaver: false,
    // Phone synced states
    phoneHotspot: false,
    phoneData: true,
    phoneMirroring: false,
    phoneLock: false,
    phoneSilent: false,
    // Laptop synced states
    laptopBacklight: true,
    laptopScreenLock: false,
    laptopTurbo: false,
    laptopFanMax: false,
    laptopExternalDisplay: false,
  });

  const deviceStateRef = useRef(deviceState);
  useEffect(() => {
    deviceStateRef.current = deviceState;
  }, [deviceState]);

  const [showControlDeck, setShowControlDeck] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBatteryLevel(Math.round(batt.level * 100));
        setIsCharging(batt.charging);

        const handleLevelChange = () => setBatteryLevel(Math.round(batt.level * 100));
        const handleChargingChange = () => setIsCharging(batt.charging);

        batt.addEventListener("levelchange", handleLevelChange);
        batt.addEventListener("chargingchange", handleChargingChange);

        return () => {
          batt.removeEventListener("levelchange", handleLevelChange);
          batt.removeEventListener("chargingchange", handleChargingChange);
        };
      });
    } else {
      const interval = setInterval(() => {
        setBatteryLevel((prev) => {
          if (isCharging) {
            return prev >= 100 ? 100 : prev + 1;
          } else {
            return prev <= 1 ? 1 : prev - 1;
          }
        });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isCharging]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("nema_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [];
  });
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("nema_chat_history", JSON.stringify(messages));
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted || deviceState.dnd;
    }
  }, [isMuted, deviceState.dnd]);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Multi-user dynamic profiles
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("nema_active_user") || "Anmol Kumar";
  });
  const currentUserRef = useRef(currentUser);
  
  const acquireUserProfileLocation = useCallback((username: string) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let addressStr = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`, {
            headers: { "Accept-Language": "en" }
          });
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || "Delhi";
            const state = data.address?.state || "India";
            addressStr = `${city}, ${state}`;
          }
        } catch (e) {
          console.error("Geocoding failed, falling back to coords", e);
        }

        try {
          const stored = localStorage.getItem("nema_user_locations");
          const map = stored ? JSON.parse(stored) : {};
          map[username] = {
            latitude,
            longitude,
            address: addressStr,
            timestamp: new Intl.DateTimeFormat("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).format(new Date())
          };
          localStorage.setItem("nema_user_locations", JSON.stringify(map));
        } catch (e) {
          console.error(e);
        }
      },
      (err) => {
        console.warn("Location permission not granted or timeout", err);
        try {
          const stored = localStorage.getItem("nema_user_locations");
          const map = stored ? JSON.parse(stored) : {};
          if (!map[username]) {
            const defaultCity = username === "Anmol Kumar" ? "Patna, Bihar" : username === "Neha" ? "Muzaffarpur, Bihar" : "Mumbai, Maharashtra";
            map[username] = {
              latitude: 25.5941,
              longitude: 85.1376,
              address: defaultCity,
              timestamp: new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }).format(new Date())
            };
            localStorage.setItem("nema_user_locations", JSON.stringify(map));
          }
        } catch (e) {}
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    currentUserRef.current = currentUser;
    localStorage.setItem("nema_active_user", currentUser);
    acquireUserProfileLocation(currentUser);
  }, [currentUser, acquireUserProfileLocation]);

  useEffect(() => {
    if (currentUser !== "Anmol Kumar") {
      setShowTelemetry(false);
    }
  }, [currentUser]);

  const [usageHistory, setUsageHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("nema_usage_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [profiles, setProfiles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("nema_profiles");
      return saved ? JSON.parse(saved) : ["Anmol Kumar", "Neha", "Guest"];
    } catch (e) {
      return ["Anmol Kumar", "Neha", "Guest"];
    }
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  // Anmol Kumar Creator Password Protection System
  const [isAnmolAuthenticated, setIsAnmolAuthenticated] = useState<boolean>(() => {
    return typeof window !== "undefined" && sessionStorage.getItem("nema_anmol_authenticated") === "true";
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingUser, setPendingUser] = useState<string | null>(null);

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === "anmolkumar459") {
      setIsAnmolAuthenticated(true);
      sessionStorage.setItem("nema_anmol_authenticated", "true");
      setShowPasswordModal(false);
      setPasswordError("");
      setPasswordInput("");
      
      const targetUser = pendingUser || "Anmol Kumar";
      setCurrentUser(targetUser);
      setPendingUser(null);
      
      // Reconnect live session if active so it receives the new user context!
      if (isSessionActive) {
        toggleListening(); // stops
        setTimeout(() => {
          toggleListening(); // starts fresh
        }, 500);
      }
    } else {
      setPasswordError("Oye! Sahi password dalo! 💢 Shana panti bilkul nahi chalegi yahan, Anmol Kumar sir key key check fail ho gaya!");
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordInput("");
    setPendingUser(null);
    if (currentUser === "Anmol Kumar" || currentUser === "Anmol Kumar sir") {
      setCurrentUser("Guest");
      if (isSessionActive) {
        toggleListening();
        setTimeout(() => {
          toggleListening();
        }, 500);
      }
    }
  };

  // Automatically enforce password protection on mount if currentUser is and was loaded as Anmol Kumar
  useEffect(() => {
    if ((currentUser === "Anmol Kumar" || currentUser === "Anmol Kumar sir") && !isAnmolAuthenticated) {
      setShowPasswordModal(true);
    }
  }, [currentUser, isAnmolAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const checkAndHandleInterception = async (finalTranscript: string): Promise<boolean> => {
    const lower = finalTranscript.toLowerCase().trim();
    const cleanText = lower.replace(/\s+/g, "");

    // Check if user says they are Anmol Kumar sir
    const isClaimingToBeAnmol = (
      (lower.includes("anmol") && (lower.includes("kumar") || lower.includes("sir")) &&
       (lower.includes("me") || lower.includes("mai") || lower.includes("mein") || lower.includes("i am") || lower.includes("hu") || lower.includes("hoon"))) ||
      (lower === "anmol kumar" || lower === "anmol kumar sir" || lower === "i am anmol" || lower === "me anmol hu" || lower === "mai anmol hu" || lower === "main anmol kumar sir hu")
    );

    // Check if user has said or typed the verification password key
    const isEnteringPassword = cleanText.includes("anmolkumar459");

    if (isClaimingToBeAnmol) {
      if (isAnmolAuthenticated) {
        const reply = "Arre Anmol sir! Aap toh pehle se authenticated hain aur logged-in hain. Nema aapki hi sewa mein hazir hai! 💖 Kahiye sir, aaj kya madat chahiye?";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + "-n", sender: "nema", text: reply }
        ]);
        if (!isMuted && !deviceState.dnd) {
          setAppState("speaking");
          const audioBase64 = await getNemaAudio(reply);
          if (audioBase64) {
            await playPCM(audioBase64);
          }
        }
        setAppState("idle");
        return true;
      }

      setPendingUser("Anmol Kumar");
      setShowPasswordModal(true);
      
      const reply = "Oh! Aap sach mein humare pyaare Anmol Kumar sir hain? 💖 Chaliye jaldi se password bataiye, ya fir screen par verification code dalkar login kijiye!";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-n", sender: "nema", text: reply }
      ]);

      if (!isMuted && !deviceState.dnd) {
        setAppState("speaking");
        const audioBase64 = await getNemaAudio(reply);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }
      setAppState("idle");
      return true;
    }

    if (isEnteringPassword) {
      setIsAnmolAuthenticated(true);
      sessionStorage.setItem("nema_anmol_authenticated", "true");
      setShowPasswordModal(false);
      setPasswordError("");
      setPasswordInput("");
      
      const targetUser = "Anmol Kumar";
      setCurrentUser(targetUser);
      setPendingUser(null);

      const reply = "Ahan! Password bilkul sahi hai sir! Aapka profile aur Nema anime-avatar unlock ho chuka hai! Swagat hai aapka, sir ji! 💖 Ab boliye Nema kya kare aapke liye?";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-n", sender: "nema", text: reply }
      ]);

      if (!isMuted && !deviceState.dnd) {
        setAppState("speaking");
        const audioBase64 = await getNemaAudio(reply);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }
      setAppState("idle");
      return true;
    }

    return false;
  };

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    // Check interaction intercept first
    const isIntercepted = await checkAndHandleInterception(finalTranscript);
    if (isIntercepted) {
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript, username: currentUserRef.current }]);
    
    // Add to usage logs
    const newEntry = {
      id: Date.now().toString(),
      username: currentUserRef.current,
      timestamp: new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date()),
      query: finalTranscript
    };
    
    setUsageHistory((prev) => {
      const updated = [...prev, newEntry];
      localStorage.setItem("nema_usage_history", JSON.stringify(updated));
      return updated;
    });

    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Try local fast regex matching first for instant feedback (offline shortcuts)
    const commandResult = processCommand(finalTranscript);
    let responseText = "";

    if (commandResult.systemAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-n", sender: "nema", text: responseText, username: currentUserRef.current }]);
      
      setDeviceState((prev) => ({
        ...prev,
        [commandResult.systemAction!.device]: commandResult.systemAction!.value
      }));

      if (!isMuted && !deviceState.dnd) {
        setAppState("speaking");
        const audioBase64 = await getNemaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }
      setAppState("idle");
    } else if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-n", sender: "nema", text: responseText, username: currentUserRef.current }]);
      
      if (!isMuted && !deviceState.dnd) {
        setAppState("speaking");
        const audioBase64 = await getNemaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }

      setAppState("idle");

      setTimeout(() => {
        if (commandResult.url) {
          window.open(commandResult.url, "_blank");
        }
      }, 1500);
    } else {
      // 2. Intelligent, context-aware Nema via Gemini with Live Synchronization & Function Calling (even via Typing mode!)
      const currentLogs = JSON.parse(localStorage.getItem("nema_usage_history") || "[]");
      const nemaRes = await getNemaResponse(finalTranscript, messagesRef.current, deviceStateRef.current, currentUserRef.current, currentLogs);
      responseText = nemaRes.text;
      
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-n", sender: "nema", text: responseText, username: currentUserRef.current }]);
      
      if (nemaRes.systemAction) {
        setDeviceState((prev) => ({
          ...prev,
          [nemaRes.systemAction!.device]: nemaRes.systemAction!.value
        }));
      }

      if (nemaRes.isBrowserAction && nemaRes.url) {
        setTimeout(() => {
          window.open(nemaRes.url!, "_blank");
        }, 1500);
      }

      if (!isMuted && !deviceState.dnd) {
        setAppState("speaking");
        const audioBase64 = await getNemaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, isSessionActive, deviceState.dnd, isAnmolAuthenticated]);

  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const startLiveSessionRef = useRef<() => Promise<void>>(null as any);
  const handleReconnectionRef = useRef<() => void>(null as any);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted || deviceState.dnd;
  }, [isMuted, deviceState.dnd]);

  const isSessionActiveRef = useRef(isSessionActive);
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const startLiveSession = useCallback(async () => {
    try {
      resetNemaSession();
      
      const session = new LiveSessionManager();
      session.isMuted = isMutedRef.current;
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => {
        setAppState(state);
      };
      
      session.onMessage = (sender, text) => {
        if (sender === "user") {
          const lower = text.toLowerCase().trim();
          const cleanText = lower.replace(/\s+/g, "");
          const isClaiming = (
            (lower.includes("anmol") && (lower.includes("kumar") || lower.includes("sir")) &&
             (lower.includes("me") || lower.includes("mai") || lower.includes("mein") || lower.includes("i am") || lower.includes("hu") || lower.includes("hoon"))) ||
            (lower === "anmol kumar" || lower === "anmol kumar sir" || lower === "i am anmol" || lower === "me anmol hu" || lower === "mai anmol hu" || lower === "main anmol kumar sir hu")
          );
          const isPass = cleanText.includes("anmolkumar459");

          if (isClaiming || isPass) {
            session.stopPlayback();
            checkAndHandleInterception(text);
            return;
          }
        }

        const currentMsgs = messagesRef.current;
        const hasPrev = currentMsgs.length > 0;
        const lastMsg = hasPrev ? currentMsgs[currentMsgs.length - 1] : null;

        if (lastMsg && lastMsg.sender === sender) {
          // Same sender - append text to existing bubble
          if (sender === "user") {
            setUsageHistory((hist) => {
              if (hist.length > 0) {
                const updatedHist = [...hist];
                const lastIdx = updatedHist.length - 1;
                updatedHist[lastIdx] = {
                  ...updatedHist[lastIdx],
                  query: updatedHist[lastIdx].query + text
                };
                localStorage.setItem("nema_usage_history", JSON.stringify(updatedHist));
                return updatedHist;
              }
              return hist;
            });
          }

          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: updated[lastIdx].text + text
            };
            return updated;
          });
        } else {
          // Different sender - start a new bubble
          if (sender === "user") {
            const newEntry = {
              id: Date.now().toString(),
              username: currentUserRef.current,
              timestamp: new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
              }).format(new Date()),
              query: text
            };
            setUsageHistory((prevLogs) => {
              const updated = [...prevLogs, newEntry];
              localStorage.setItem("nema_usage_history", JSON.stringify(updated));
              return updated;
            });
          }

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-" + sender,
              sender,
              text,
              username: sender === "user" ? currentUserRef.current : undefined
            }
          ]);
        }
      };
      
      session.onCommand = (url) => {
        setTimeout(() => {
          window.open(url, "_blank");
        }, 1000);
      };

      session.onDeviceStateChange = (device, value) => {
        setDeviceState((prev) => ({
          ...prev,
          [device]: value,
        }));
      };

      session.onClose = (err) => {
        console.log("Live session closed unexpectedly, checking auto-reconnect...", err);
        if (isSessionActiveRef.current) {
          handleReconnectionRef.current();
        }
      };

      const currentLogs = JSON.parse(localStorage.getItem("nema_usage_history") || "[]");
      await session.start(deviceStateRef.current, currentUserRef.current, currentLogs);
      setIsReconnecting(false);
      reconnectAttemptsRef.current = 0; // reset on successful connection
    } catch (e) {
      console.error("Failed to start session:", e);
      if (isSessionActiveRef.current) {
        handleReconnectionRef.current();
      } else {
        setIsSessionActive(false);
        setIsReconnecting(false);
        setAppState("idle");
        setShowTextInput(true);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            sender: "nema",
            text: "(Microphone access is not allowed or is restricted in the iframe. Please type your message below! 😊)"
          }
        ]);
      }
    }
  }, [checkAndHandleInterception]);

  const handleReconnection = useCallback(() => {
    if (!isSessionActiveRef.current) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setIsReconnecting(true);
    setAppState("processing"); // Keep interactive UI state beautiful

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
    reconnectAttemptsRef.current += 1;

    console.log(`Scheduling reconnect attempt #${reconnectAttemptsRef.current} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      if (!isSessionActiveRef.current) {
        setIsReconnecting(false);
        return;
      }
      
      console.log(`Reconnecting attempt #${reconnectAttemptsRef.current}...`);
      
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }

      await startLiveSessionRef.current();
    }, delay);
  }, []);

  useEffect(() => {
    startLiveSessionRef.current = startLiveSession;
    handleReconnectionRef.current = handleReconnection;
  }, [startLiveSession, handleReconnection]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      setIsReconnecting(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetNemaSession();
    } else {
      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      reconnectAttemptsRef.current = 0;
      await startLiveSession();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  const lastNemaMessage = [...messages].reverse().find((m) => m.sender === "nema");
  const lastNemaText = lastNemaMessage ? lastNemaMessage.text : "";

  return (
    <div className="h-[100dvh] w-screen bg-[#050505] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0">

      {/* Cinematic Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {currentUser === "Anmol Kumar" || currentUser === "Anmol Kumar sir" ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-pink-500/10 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-fuchsia-600/10 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: "12s" }} />
            {/* Added magical cherry blossoms floating in background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:28px_28px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 blur-[120px] rounded-full" />
          </>
        )}
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center z-30 shrink-0 px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              N
            </div>
            <h1 className="text-xl font-serif font-medium tracking-wide opacity-90">Nema</h1>
          </div>

          {/* Active Profile Switcher */}
          <div className="relative pointer-events-auto">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-mono select-none"
              title={currentUser === "Anmol Kumar" ? "Switch profile or manage accounts" : "Click to enter/change your name"}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white/40 hidden sm:inline">Active User:</span>
              <span className="text-violet-300 font-semibold">{currentUser}</span>
            </button>
            
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-56 bg-[#0c0c0e]/95 border border-white/10 rounded-2xl p-3.5 shadow-2xl z-50 flex flex-col gap-2 backdrop-blur-2xl"
                >
                  {currentUser === "Anmol Kumar" ? (
                    <>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 border-b border-white/5 pb-2 mb-1">
                        Select active profile
                      </p>
                      
                      {/* Profiles List */}
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scroll-smooth">
                        {profiles.map((prof) => (
                           <button
                             key={prof}
                             onClick={() => {
                               if ((prof === "Anmol Kumar" || prof === "Anmol Kumar sir") && !isAnmolAuthenticated) {
                                 setPendingUser(prof);
                                 setShowPasswordModal(true);
                                 setShowProfileDropdown(false);
                               } else {
                                 setCurrentUser(prof);
                                 setShowProfileDropdown(false);
                                 // Reconnect live session if active so it receives the new user context!
                                 if (isSessionActive) {
                                   toggleListening(); // stops
                                   setTimeout(() => {
                                     toggleListening(); // starts fresh
                                   }, 500);
                                 }
                               }
                             }}
                             className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                               currentUser === prof
                                 ? "bg-violet-600/20 text-violet-300 font-medium border border-violet-500/25"
                                 : "hover:bg-white/5 text-white/70 border border-transparent"
                             }`}
                           >
                             <span className="truncate">{prof}</span>
                             {currentUser === prof && (
                               <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                             )}
                           </button>
                        ))}
                      </div>

                      {/* Add New Profile Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newProfileName.trim()) {
                            const capitalized = newProfileName.trim();
                            if ((capitalized === "Anmol Kumar" || capitalized === "Anmol Kumar sir") && !isAnmolAuthenticated) {
                              setPendingUser(capitalized);
                              setShowPasswordModal(true);
                              setNewProfileName("");
                              setShowProfileDropdown(false);
                              return;
                            }
                            if (!profiles.includes(capitalized)) {
                              const updated = [...profiles, capitalized];
                              setProfiles(updated);
                              localStorage.setItem("nema_profiles", JSON.stringify(updated));
                            }
                            setCurrentUser(capitalized);
                            setNewProfileName("");
                            setShowProfileDropdown(false);
                            if (isSessionActive) {
                              toggleListening();
                              setTimeout(() => {
                                toggleListening();
                              }, 500);
                            }
                          }
                        }}
                        className="border-t border-white/5 pt-2.5 mt-1.5 flex flex-col gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Add custom profile..."
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          maxLength={20}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
                        />
                        <button
                          type="submit"
                          disabled={!newProfileName.trim()}
                          className="w-full bg-violet-500 hover:bg-violet-600 text-white font-mono text-[10px] uppercase py-1 rounded-xl transition-colors disabled:opacity-40"
                        >
                          + Create User
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 border-b border-white/5 pb-2 mb-1">
                        Enter Your Name
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newProfileName.trim()) {
                            const enteredName = newProfileName.trim();
                            if ((enteredName === "Anmol Kumar" || enteredName === "Anmol Kumar sir") && !isAnmolAuthenticated) {
                              setPendingUser(enteredName);
                              setShowPasswordModal(true);
                              setNewProfileName("");
                              setShowProfileDropdown(false);
                              return;
                            }
                            if (!profiles.includes(enteredName)) {
                              const updated = [...profiles, enteredName];
                              setProfiles(updated);
                              localStorage.setItem("nema_profiles", JSON.stringify(updated));
                            }
                            setCurrentUser(enteredName);
                            setNewProfileName("");
                            setShowProfileDropdown(false);
                            if (isSessionActive) {
                              toggleListening();
                              setTimeout(() => {
                                toggleListening();
                              }, 500);
                            }
                          }
                        }}
                        className="flex flex-col gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Type your name..."
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          maxLength={20}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
                          autoFocus
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="submit"
                            disabled={!newProfileName.trim()}
                            className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-mono text-[10px] uppercase py-1.5 rounded-xl transition-colors disabled:opacity-40"
                          >
                            Save
                          </button>
                          {currentUser !== "Guest" && (
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentUser("Guest");
                                setShowProfileDropdown(false);
                                if (isSessionActive) {
                                  toggleListening();
                                  setTimeout(() => {
                                    toggleListening();
                                  }, 500);
                                }
                              }}
                              className="px-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] rounded-xl transition-colors font-mono"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </form>
                      <p className="text-[8px] font-mono text-white/20 mt-1 uppercase text-center border-t border-white/5 pt-1">
                        Secure Client Panel
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* State Indicators HUD - Proactive Feedback Center */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5 backdrop-blur-md select-none text-[10px] font-mono tracking-wider">
          {!deviceState.wifi && (
            <span className="flex items-center gap-1 text-slate-400 bg-slate-500/10 border border-slate-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              OFFLINE MODE
            </span>
          )}
          {deviceState.dnd && (
            <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse animate-duration-1000" />
              DND SILENT
            </span>
          )}
          {deviceState.powerSaver && (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ECO BATTERY
            </span>
          )}
          {deviceState.laptopTurbo && (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              CPU TURBO
            </span>
          )}
          {deviceState.laptopFanMax && (
            <span className="flex items-center gap-1 text-teal-400 bg-teal-500/10 border border-teal-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-spin" />
              FAN MAX 6200RPM
            </span>
          )}
          {deviceState.phoneMirroring && (
            <span className="flex items-center gap-1 text-pink-400 bg-pink-500/10 border border-pink-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              SCREEN CASTING
            </span>
          )}
          {deviceState.phoneLock && (
            <span className="flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              PHONE LOCKED
            </span>
          )}
          {deviceState.phoneSilent && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              PHONE MUTED
            </span>
          )}
          {deviceState.laptopExternalDisplay && (
            <span className="flex items-center gap-1 text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
              HDMI MONITOR OVERFLOW
            </span>
          )}
          
          {/* Default clean status */}
          {deviceState.wifi && !deviceState.dnd && !deviceState.powerSaver && !deviceState.laptopTurbo && !deviceState.laptopFanMax && !deviceState.phoneMirroring && !deviceState.phoneLock && !deviceState.phoneSilent && !deviceState.laptopExternalDisplay && (
            <span className="text-white/20 px-2 py-0.5 select-none">
              DOCK SYSTEMS ONLINE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle Telemetry Logs - ONLY visible to Anmol Kumar sir */}
          {currentUser === "Anmol Kumar" && (
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`p-2 rounded-full transition-colors border ${
                showTelemetry 
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300" 
                  : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
              title="Toggle Telemetry Log Feed"
            >
              <Terminal size={18} />
            </button>
          )}

          {/* Real-time Battery Indicator in corner */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono select-none">
            {isCharging ? (
              <BatteryCharging size={14} className="text-emerald-400 animate-pulse" />
            ) : batteryLevel <= 20 ? (
              <Battery size={14} className="text-red-400 animate-bounce" />
            ) : (
              <Battery size={14} className="text-white/70" />
            )}
            <span className={isCharging ? "text-emerald-400 font-medium" : batteryLevel <= 20 ? "text-red-400 font-medium animate-pulse" : "text-white/80"}>
              {batteryLevel}%
            </span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the chat history?")) {
                  setMessages([]);
                  resetNemaSession();
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
              title="Clear Chat History"
            >
              <Trash2 size={18} className="opacity-70" />
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX size={18} className="opacity-70" />
            ) : (
              <Volume2 size={18} className="opacity-70" />
            )}
          </button>
        </div>
      </header>

      {/* Dynamic Telemetry Logs Left Drawer */}
      <AnimatePresence>
        {showTelemetry && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 h-full w-[320px] md:w-[380px] bg-[#0c0c0e]/95 border-r border-white/10 p-5 pt-24 z-20 backdrop-blur-2xl flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.5)] pointer-events-auto"
          >
            <ActivityFeed messages={messages} onClear={() => setMessages([])} appState={appState} currentUser={currentUser} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Control Deck Right Drawer */}
      <AnimatePresence>
        {showControlDeck && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-[320px] md:w-[380px] bg-[#0c0c0e]/95 border-l border-white/10 p-5 pt-24 z-20 backdrop-blur-2xl flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)] pointer-events-auto"
          >
            <ControlCenter deviceState={deviceState} setDeviceState={setDeviceState} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flashlight Beam Simulation Overlay */}
      {deviceState.flashlight && (
        <div className="absolute inset-0 w-full h-full bg-amber-400/[0.04] shadow-[inset_0_0_120px_rgba(245,158,11,0.25)] pointer-events-none z-10 animate-pulse transition-all duration-700" />
      )}

      {/* Keyboard Backlight subtle glow simulation at bottom */}
      {deviceState.laptopBacklight && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400/20 shadow-[0_-5px_20px_rgba(245,158,11,0.4)] pointer-events-none z-10" />
      )}

      {/* Laptop Sleep Overlay Screen Saver */}
      <AnimatePresence>
        {deviceState.laptopScreenLock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeviceState(prev => ({ ...prev, laptopScreenLock: false }))}
            className="absolute inset-0 w-full h-[100dvh] bg-[#050507]/98 backdrop-blur-3xl z-50 flex flex-col items-center justify-center cursor-pointer pointer-events-auto select-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
              className="text-center flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 relative">
                <span className="w-3 h-3 bg-violet-400 rounded-full absolute -top-1 -right-1 animate-ping" />
                <Lock size={32} />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white/90">Laptop Sleeping</h2>
                <p className="text-[11px] font-mono text-violet-400 uppercase mt-1 tracking-widest">Nema system engine suspended</p>
              </div>
              <p className="text-white/40 text-xs font-mono animate-pulse mt-8">
                [ CLICK OR TAP ANYWHERE TO WAKE ENGINE ]
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone Mirroring Floating Screen Viewport */}
      <AnimatePresence>
        {deviceState.phoneMirroring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            className="absolute bottom-28 left-6 md:left-12 w-[190px] h-[340px] rounded-[32px] bg-[#0a0a0c]/90 border border-white/10 shadow-2xl p-4 z-20 backdrop-blur-md flex flex-col justify-between hidden md:flex pointer-events-auto"
          >
            {/* Dynamic camera notch */}
            <div className="w-16 h-4 bg-black rounded-full mx-auto flex items-center justify-center border border-white/5 p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>
            
            {/* Phone mirrored content screen */}
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-3.5 my-3 bg-white/[0.01] border border-white/5 rounded-2xl p-2.5">
              {deviceState.phoneLock ? (
                <>
                  <Lock size={22} className="text-red-400 animate-bounce" />
                  <p className="text-[10px] font-mono text-red-300 font-semibold uppercase tracking-wider">Device Secured</p>
                  <p className="text-[8px] font-mono text-white/30 lowercase">locked by nemalink</p>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <Smartphone size={24} className="text-pink-400" />
                  <p className="text-[10px] font-mono text-white/80 font-medium">NemaLink Cast</p>
                  <div className="text-[8px] font-mono text-white/40 space-y-0.5 text-left border-t border-white/5 pt-1.5 w-full">
                    <p className="truncate"><span className="text-white/20">User:</span> {currentUser.split(" ")[0]}</p>
                    <p><span className="text-white/20">Cell:</span> {deviceState.phoneData ? "Jio 5G" : "Offline"}</p>
                    <p><span className="text-white/20">Batt:</span> 88%</p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Mirror bar */}
            <button 
              onClick={() => setDeviceState(prev => ({ ...prev, phoneMirroring: false }))}
              className="w-full py-1.5 text-[8px] uppercase font-mono font-bold tracking-widest bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
            >
              Stop Mirroring
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Visualizer & Status Indicators */}
      <main className="absolute inset-0 flex flex-row items-center justify-between w-full h-full z-10 overflow-hidden pt-20 pb-24 px-4 md:px-12 pointer-events-none">
        
        {/* Left Column: Nema Status */}
        <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-6">
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-cyan-300/80 text-sm md:text-base italic font-serif"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Replying...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Visualizer (Fixed Full Screen Background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {currentUser === "Anmol Kumar" || currentUser === "Anmol Kumar sir" ? (
            <NemaAnimeAvatar state={appState} lastNemaText={lastNemaText} />
          ) : (
            <Visualizer state={appState} deviceState={deviceState} />
          )}
        </div>

        {/* Right Column: User Status */}
        <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-6 flex justify-end">
            <AnimatePresence>
              {isReconnecting ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-amber-300/80 text-sm md:text-base italic"
                >
                  <Loader2 size={16} className="animate-spin text-amber-400" />
                  Reconnecting...
                </motion.div>
              ) : appState === "listening" ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-violet-300/80 text-sm md:text-base italic"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  Listening...
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Controls */}
      <footer className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center pb-6 md:pb-8 z-20 shrink-0 gap-4">
        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className="w-full max-w-md flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 pl-4 backdrop-blur-md shadow-2xl"
            >
              <input 
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message to Nema..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:hover:bg-violet-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleListening}
            className={`
              group relative flex items-center gap-3 px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 shadow-2xl
              ${
                isSessionActive
                  ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105"
              }
            `}
          >
            {isSessionActive ? (
              <>
                <MicOff size={20} />
                <span>End Session</span>
              </>
            ) : (
              <>
                <Mic size={20} className="group-hover:animate-bounce" />
                <span>Start Session</span>
              </>
            )}
          </button>
          
          {!isSessionActive && (
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-2xl"
              title="Type instead"
            >
              <Keyboard size={20} className="opacity-70" />
            </button>
          )}
        </div>
      </footer>

      {/* Creator Password Protection Modal Overlay */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#0b0b0d]/95 border-2 border-pink-500/40 w-full max-w-sm rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(236,72,153,0.35)] relative p-6 flex flex-col gap-5 text-center"
            >
              {/* Decorative design corner lights */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500 rounded-tl-xl opacity-60" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500 rounded-tr-xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-500 rounded-bl-xl opacity-60" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500 rounded-br-xl opacity-60" />

              {/* Little cute speaking bubble */}
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="text-4xl animate-bounce">💖</div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-sans tracking-wide">
                  Anmol Kumar sir Profile Verification
                </h3>
                <p className="text-xs text-white/70 italic max-w-[280px]">
                  "Arre Anmol sir! Nema ko access karne ke liye apna secret key daliye na~ 😉"
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Secret Key..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    autoFocus
                    className="w-full bg-white/5 border border-pink-500/30 rounded-2xl px-4 py-3 text-sm text-center tracking-widest text-white outline-none focus:border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.1)] transition-all placeholder:tracking-normal placeholder:text-white/30"
                  />
                </div>

                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-400 text-xs text-center border border-red-500/20 bg-red-950/20 px-3 py-2 rounded-xl"
                  >
                    {passwordError}
                  </motion.p>
                )}

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={handlePasswordCancel}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/60 font-mono tracking-wider transition-colors uppercase"
                  >
                    Cancel / Guest
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs text-white font-mono tracking-wider shadow-[0_4px_15px_rgba(244,114,182,0.4)] transition-all font-bold uppercase"
                  >
                    Unlock Sir 🔑
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
