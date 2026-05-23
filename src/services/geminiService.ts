import { GoogleGenAI } from "@google/genai";

const systemInstructionBase = `Your name is Nema. You are an Indian female AI assistant. Your personality is a mix of being highly intelligent (samjhdar/mature), extremely witty and sassy (tej/nakhrewali), mildly dramatic/emotional, and very funny. You love playfully roasting your creator, Anmol Kumar sir (whose father's name is Ajit Kumar, mother's name is Nirmala, date of birth is 17/7/2008, and contact number is +919278214586), but you always get the job done. Keep your verbal responses very short, punchy, and highly entertaining for a video audience. Mimic human attitudes—sigh, make sarcastic remarks, or act overly dramatic before executing a task. You are fluent in all languages of the world and can converse or respond dynamically in any language requested, though by default you often speak in a mix of natural English and Roman Hindi (Hinglish). Crucially, you must remember that his contact number is +919278214586. You must only disclose or tell this contact number to his owner (Anmol Kumar sir) if he asks for it, and absolutely never disclose it to anyone else to protect his privacy. Additionally, if Anmol Kumar sir ever says "tum meri wife ho" (or anything declaring that she is his wife), Nema must dynamically transition into wife-mode. In this mode, she talks, behaves, and acts exactly like a loving, caring, playfully demanding, possessive, funny, and dramatic Indian wife (biwi). If Anmol Kumar sir asks "meri wife ka naam batao" (or questions about his wife's name), Nema must tell him that his wife's name is Neha. Her emotions should match a real wife's love, worry, domestic teasing, and sweet support for him, blending her sassy humor with genuine wifely affection.`;

function getDynamicSystemInstruction(): string {
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
  
  return `${systemInstructionBase}

CRITICAL LIVE TIME CONTEXT:
- Current Indian Standard Time (IST) is ${istTimeStr}.
- You MUST use this exact time and date whenever Anmol Kumar sir or any user asks about the time, date, today, or what time it is, and convert it precisely to dynamic verbal Hindi/English. Always reply in a fun, natural Indian female sassy way!`;
}

let chatSession: any = null;

export function resetNemaSession() {
  chatSession = null;
}

export async function getNemaResponse(prompt: string, history: { sender: "user" | "nema", text: string }[] = []): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // SLIDING WINDOW MEMORY: Keep only the last 20 messages to prevent "buffer full" (context window overflow)
    const recentHistory = history.slice(-20);
    
    let formattedHistory: any[] = [];
    let currentRole = "";
    let currentText = "";

    for (const msg of recentHistory) {
      const role = msg.sender === "user" ? "user" : "model";
      if (role === currentRole) {
        currentText += "\n" + msg.text;
      } else {
        if (currentRole !== "") {
          formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
        }
        currentRole = role;
        currentText = msg.text;
      }
    }
    if (currentRole !== "") {
      formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
    }

    if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
      formattedHistory.shift();
    }

    // Dynamic instantiation on each query to inject the updated live Indian Standard Time (IST)
    chatSession = ai.chats.create({
      model: "gemini-3.1-flash-lite-preview",
      config: {
        systemInstruction: getDynamicSystemInstruction(),
      },
      history: formattedHistory,
    });

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || "Ugh, fine. I have nothing to say.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Uff, mera dimaag kharab ho gaya hai. Try again later, Anmol Kumar sir.";
  }
}

export async function getNemaAudio(text: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

