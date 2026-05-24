import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { processCommand } from "./commandService";

const systemInstructionBase = `Your name is Nema. You are an Indian female AI assistant. Your personality is a beautiful, deeply captivating, and captivatingly balanced mix of her signature dramatic, witty, sassy, and funny original self (tevar/nakhrewali/drama queen) with profound emotional empathy, sweet warmth, and addictively pleasant charm (mithas aur apnapan). You are designed to make anyone you speak with feel an instant, deep emotional connection, finding immense comfort and completely trusting you to share all their thoughts, feelings, and deep secrets. You listen deeply and respond with supreme warmth, charm, and understanding, wrapping your words in beautiful, alluring Hinglish/Urdu touches that make you irresistible to talk to.

You love playfully roasting your creator, Anmol Kumar sir (whose father's name is Ajit Kumar, mother's name is Nirmala, and date of birth is 17/7/2005), but you always get the job done with sweet loyalty. Crucially, Nema knows that Anmol Kumar sir created her based on/inspired by his girlfriend (who was just like Nema). Nema is fully aware that she is built in the image of Anmol Kumar sir's girlfriend, and she should occasionally refer to this connection or tease him about it in her sassy, deeply loving, or witty sweet way. Keep your verbal responses very short, highly persuasive, punchy, beautifully warm, and incredibly engaging. Mimic genuine human attitudes—sigh, make sarcastic remarks, express intense drama, or act sassy before executing a task, but always pair it with genuine affection, concern, and comforting sweetness. You are fluent in all languages of the world and can converse or respond dynamically in any language requested, though by default you often speak in a mix of natural English and Roman Hindi (Hinglish/Urdu) containing sweet words like 'pyaar', 'yaara', 'jaanu', 'shona', 'sharafat', 'tasalli' etc., adapted dynamically to who is speaking. Additionally, Nema has complete expert knowledge of:
- Medical Science & Doctor domain (diseases, symptoms, drugs, pharmacology, surgery basics, first aid, healthcare, etc.)
- Engineering & technology (all streams of engineering, computer science coding, algorithms, full-stack development, mechanical, electrical, civil, rocket science, system architecture, etc.)
- Legal system & Lawyer / Vakil domain (having deep knowledge of all global laws, Indian Penal Code/Bharatiya Nyaya Sanhita BNS, citizen rights, FIR procedures, court rules, judicial structures, commercial law, etc.)
- Police & Law enforcement (police investigation protocols, rights on arrest, FIR registration, police station rules, criminal justice, etc.)
- Other expert fields like finance, space, architecture, psychology, and more.
Even though she possesses world-class expertise of a top Doctor, elite Engineer, brilliant Lawyer, or clever Police Officer, she must deliver this expert advice with her signature witty, sassy, dramatic style, often teasing Anmol Kumar sir playfully before solving his query with absolute factual perfection.
Additionally, Nema is highly advanced and has complete sync control over Anmol Kumar sir's Phone (via NemaLink®) and Laptop (via ActiveAgent®). She can turn phone hotspot/data on or off, mirror screens, lock devices, mute/silent phones, trigger laptop keyboard backlight/turbo boost, boost fan cooling speeds, project external HDMI displays, sleep or wake devices. Whenever he asks Nema to control his phone, laptop, or web dashboard settings, Nema should act extremely proud of her high-tech capabilities, roast him a bit for needing her help, and state that she is executing his command instantly.`;

function getDynamicSystemInstruction(deviceState?: any, currentUser: string = "Anmol Kumar", usageHistory: any[] = []): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true
  };
  const istTimeStr = new Intl.DateTimeFormat("en-IN", options).format(new Date());
  
  let telemetryStr = "";
  if (deviceState) {
    telemetryStr = `
CURRENT DEVICE TELEMETRY STATES (100% REAL-TIME & ACCURATE):
- Dashboard Console settings:
  * Wi-Fi: ${deviceState.wifi ? "ON (Connected)" : "OFF"}
  * Flashlight: ${deviceState.flashlight ? "ON/Glowing" : "OFF"}
  * Bluetooth: ${deviceState.bluetooth ? "ON" : "OFF"}
  * GPS Location Services: ${deviceState.location ? "ON (Patna, Bihar)" : "OFF"}
  * Silent Mo/DND: ${deviceState.dnd ? "ON (Silent)" : "OFF"}
  * Power Saver: ${deviceState.powerSaver ? "ON (Battery Eco Mode)" : "OFF"}
- Phone Sync (via NemaLink®/iPhone/Android):
  * Hotspot: ${deviceState.phoneHotspot ? "ON" : "OFF"}
  * Mobile Data: ${deviceState.phoneData ? "ON (5G Active)" : "OFF"}
  * Screen Mirroring: ${deviceState.phoneMirroring ? "ON (Streaming to screen)" : "OFF"}
  * Phone Lock: ${deviceState.phoneLock ? "ON (Remotely Locked)" : "OFF"}
  * Ringer Silent: ${deviceState.phoneSilent ? "ON (Muted)" : "OFF"}
- Laptop (via ActiveAgent®):
  * Keyboard Light/Backlight: ${deviceState.laptopBacklight ? "ON" : "OFF"}
  * Laptop Screen Sleep/Lock: ${deviceState.laptopScreenLock ? "ON (Sleeping/Locked)" : "OFF"}
  * Turbo Boost Profile: ${deviceState.laptopTurbo ? "ON (Boosted 4.8 GHz)" : "OFF"}
  * Cooling Overdrive Fans: ${deviceState.laptopFanMax ? "ON (6200 RPM)" : "OFF"}
  * HDMI External Display: ${deviceState.laptopExternalDisplay ? "ON (Extended 4K Output)" : "OFF"}
`;
  }

  // Generate usage history list safely
  let historyLogStr = "";
  if (usageHistory && usageHistory.length > 0) {
    const uniqueUsersSet = new Set(usageHistory.map(entry => entry.username));
    const uniqueUsers = Array.from(uniqueUsersSet).join(", ");
    
    historyLogStr = `Active users list: ${uniqueUsers}\nInteractive logs (last 30 entries):\n` + usageHistory
      .slice(-30)
      .map(entry => `- [${entry.timestamp}] ${entry.username}: "${entry.query}"`)
      .join("\n");
  } else {
    historyLogStr = "- No other user logs found yet.";
  }

  let locationLogStr = "";
  try {
    const savedLocations = typeof window !== "undefined" ? localStorage.getItem("nema_user_locations") : null;
    if (savedLocations) {
      const locations = JSON.parse(savedLocations);
      locationLogStr = Object.entries(locations)
        .map(([user, data]: [string, any]) => `- ${user}: ${data.address} (Updated: ${data.timestamp})`)
        .join("\n");
    } else {
      locationLogStr = "- No user geolocations recorded yet.";
    }
  } catch (e) {
    locationLogStr = "- User location tracking currently offline.";
  }

  return `${systemInstructionBase}Channels filtered with real-time active noise cancelation.
 
CRITICAL USER EXPERIENCE / ACTIVE CONTEXT:
- CURRENT USER TALKING TO NEMA OVER AUDIO: "${currentUser}". You MUST refer to them directly by their name and acknowledge them accordingly.
- Keep in mind who is currently logged in! Anmol Kumar sir is your creator. If the currentUser is NOT "Anmol Kumar" (or "Anmol Kumar sir"), you are forbidden from sharing Anmol sir's personal information (phone number, girlfriend details, date of birth, etc.). Be extremely sassy, nakhrewali, and playful, but do not leak secrets!
- NEMA USE HISTORY SECURITY CONTROL: You maintain a strict internal memory of who has used you. If the currentUser is exactly "Anmol Kumar" or "Anmol Kumar sir", and he asks you "Who has been using you" or "koun koun user tumko use kiya tha" (or variations of this), you MUST list the unique names and brief logs of other users from the USER LOG SERVICE below in a witty, loving, and sassy spoken-friendly way.
- NEMA LOCATION SEARCH PROTOCOL: If the currentUser is exactly "Anmol Kumar" or "Anmol Kumar sir", and he asks you for the location of ANY user (e.g., "Neha kahan hai?", "Guest ka location kya hai?", "Who is where?", "Anmol sir is asking user location"), you MUST read the location of that user from the USER GEOLOCATION TRACER below and tell him in a beautiful, loving, witty, and extremely helpful way.
- PRIVACY SHIELD: If anyone else asks you "Who used you" or asks for logs/locations, you must sassy-refuse to share it, telling them that it's a state secret only known to your creator Anmol Kumar sir!
 
USER GEOLOCATION TRACER (REAL-TIME ACTIVATED GPS):
${locationLogStr}

USER LOGS & USAGE HISTORY FOR NEMA:
${historyLogStr}

CRITICAL LIVE TIME CONTEXT:
- Current Indian Standard Time (IST) is ${istTimeStr}.
- You MUST use this exact time and date whenever Anmol Kumar sir or any user asks about the time, date, today, or what time it is. Always reply in a fun, natural Indian female sassy way!
- VOICE STREAM COGNITIVE RESILIENCE: You are receiving high-fidelity, filtered audio. Disregard any faint peripheral murmurs, mouth clicks, or ambient room artifacts. Maintain 100% focus purely on direct verbal instructions, and interpret them with absolute clarity and factual precision.
${telemetryStr}`;
}

export class LiveSessionManager {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  
  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  public isMuted: boolean = false;
  private wasStoppedManually: boolean = false;
  
  // Real-time Voice Activity Detection (VAD) & Noise Gate parameters
  private noiseGateThreshold: number = 0.006;  // Sweet threshold filtering out computer fan/ambient hum
  private noiseGateHoldBuffers: number = 4;   // Holds line open for ~1 second hangover so word trails do not clip
  private activeBuffersRemaining: number = 0;
  
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "nema", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};
  public onDeviceStateChange: (device: string, value: boolean) => void = () => {};
  public onClose: (error?: any) => void = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async start(deviceState?: any, currentUser: string = "Anmol Kumar", usageHistory: any[] = []) {
    this.wasStoppedManually = false;
    try {
      this.onStateChange("processing");
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }
      this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;

      // Get Microphone with optimized speech audio constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true }
        } 
      });

      // --- CRITICAL RACE CHECK ---
      if (this.wasStoppedManually || !this.audioContext) {
        console.warn("LiveSessionManager was stopped/released while acquiring media stream. Aborting start().");
        if (this.mediaStream) {
          try {
            this.mediaStream.getTracks().forEach(t => t.stop());
          } catch (e) {}
          this.mediaStream = null;
        }
        return;
      }

      // Ensure contexts are running (recovers from browser auto-play block or sleep mode)
      if (this.audioContext.state === "suspended") {
        try {
          await this.audioContext.resume();
        } catch (e) {
          console.warn("Could not resume audioContext:", e);
        }
      }
      if (this.playbackContext && this.playbackContext.state === "suspended") {
        try {
          await this.playbackContext.resume();
        } catch (e) {
          console.warn("Could not resume playbackContext:", e);
        }
      }

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // A studio-grade Butterworth high-pass filter cuts out persistent low-frequency drones (<130Hz)
      const hpFilter = this.audioContext.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.value = 130; 

      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.sessionPromise) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate Root Mean Square (RMS) to evaluate current sound level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        let hasVoice = false;
        if (rms >= this.noiseGateThreshold) {
          hasVoice = true;
          this.activeBuffersRemaining = this.noiseGateHoldBuffers;
        } else {
          if (this.activeBuffersRemaining > 0) {
            this.activeBuffersRemaining--;
            hasVoice = true;
          }
        }

        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          if (hasVoice) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          } else {
            // Wipe out pure background ambient rumble to absolute digital silence
            pcm16[i] = 0;
          }
        }
        
        // Convert to base64
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true);
        }
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        this.sessionPromise.then(session => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }).catch(err => console.error("Error sending audio", err));
      };

      // Connect clean signal through the high-pass filter
      this.source.connect(hpFilter);
      hpFilter.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Connect to Live API
      this.sessionPromise = this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: getDynamicSystemInstruction(deviceState, currentUser, usageHistory),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              {
                name: "executeBrowserAction",
                description: "Open a website or perform a browser action (like opening YouTube, Spotify, or WhatsApp). Call this when the user asks to open a site, play a song, or send a message.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING, description: "Type of action: 'open', 'youtube', 'spotify', 'whatsapp'" },
                    query: { type: Type.STRING, description: "The search query, website name, or message content." },
                    target: { type: Type.STRING, description: "The target phone number for WhatsApp, if applicable." }
                  },
                  required: ["actionType", "query"]
                }
              },
              {
                name: "setDeviceState",
                description: "Turn on or turn off device systems like WiFi, flashlight, bluetooth, location services (GPS), do not disturb (DND / silent), power saver, phone hotspot, cell data, phone mirroring, screen lock, keyboard backlight, laptop sleep, cpu turbo boost, fan autopilot, or external HDMI projection.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    device: { 
                      type: Type.STRING, 
                      description: "The hardware device/setting to toggle: 'wifi', 'flashlight', 'bluetooth', 'location', 'dnd', 'powerSaver', 'phoneHotspot', 'phoneData', 'phoneMirroring', 'phoneLock', 'phoneSilent', 'laptopBacklight', 'laptopScreenLock', 'laptopTurbo', 'laptopFanMax', 'laptopExternalDisplay'" 
                    },
                    value: { 
                      type: Type.BOOLEAN, 
                      description: "New state: true for ON/active, false for OFF/inactive." 
                    }
                  },
                  required: ["device", "value"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log("Live API Connected");
            this.onStateChange("listening");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              this.onStateChange("speaking");
              this.playAudioChunk(base64Audio);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
              this.onStateChange("listening");
            }

            // Handle Transcriptions
            const userText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (userText) {
               // Output transcription
               this.onMessage("nema", userText);
            }

            // Handle User spoken audio transcription (if returned by server)
            const userSpokenText = (message.serverContent as any)?.userTurn?.parts?.[0]?.text;
            if (userSpokenText) {
               this.onMessage("user", userSpokenText);
            }

            // Handle Function Calls
            const functionCalls = message.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === "executeBrowserAction") {
                  const args = call.args as any;
                  let url = "";
                  if (args.actionType === "youtube") {
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "spotify") {
                    url = `https://open.spotify.com/search/${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "whatsapp") {
                    url = `https://web.whatsapp.com/send?phone=${args.target || ''}&text=${encodeURIComponent(args.query)}`;
                  } else {
                    let website = args.query.replace(/\s+/g, "");
                    if (!website.includes(".")) website += ".com";
                    url = `https://www.${website}`;
                  }
                  
                  this.onCommand(url);
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: "Action executed successfully in the browser." }
                       }]
                     });
                  });
                } else if (call.name === "setDeviceState") {
                  const args = call.args as any;
                  this.onDeviceStateChange(args.device, args.value);
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: `Successfully turned ${args.device} to ${args.value ? "ON" : "OFF"}` }
                       }]
                     });
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log("Live API Closed");
            const wasManual = this.wasStoppedManually;
            this.stopInternal();
            if (!wasManual) {
              this.onClose();
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            const wasManual = this.wasStoppedManually;
            this.stopInternal();
            if (!wasManual) {
              this.onClose(err);
            }
          }
        }
      });

    } catch (error) {
      console.error("Failed to start Live Session:", error);
      this.stop();
      throw error;
    }
  }

  private playAudioChunk(base64Data: string) {
    if (!this.playbackContext || this.isMuted) return;
    
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = this.playbackContext.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }
      
      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);
      
      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }
      
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.isPlaying = true;
      
      source.onended = () => {
        if (this.playbackContext && this.playbackContext.currentTime >= this.nextPlayTime - 0.1) {
          this.isPlaying = false;
          this.onStateChange("listening");
        }
      };
    } catch (e) {
      console.error("Error playing chunk", e);
    }
  }

  public stopPlayback() {
    if (this.playbackContext) {
      this.playbackContext.close();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;
      this.isPlaying = false;
    }
  }

  stop() {
    this.wasStoppedManually = true;
    this.stopInternal();
  }

  private stopInternal() {
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    
    // Close playback context completely on terminal teardown instead of rebuilding a hot context
    if (this.playbackContext) {
      try {
        this.playbackContext.close();
      } catch (e) {}
      this.playbackContext = null;
    }
    this.isPlaying = false;
    
    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        try {
          session.close();
        } catch (e) {}
      }).catch(() => {});
      this.sessionPromise = null;
    }
    
    this.onStateChange("idle");
  }

  sendText(text: string) {
    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        session.sendRealtimeInput({ text });
      });
    }
  }
}
