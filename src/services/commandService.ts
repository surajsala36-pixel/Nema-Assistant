export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
  systemAction?: {
    device: "wifi" | "flashlight" | "bluetooth" | "location" | "dnd" | "powerSaver" |
            "phoneHotspot" | "phoneData" | "phoneMirroring" | "phoneLock" | "phoneSilent" |
            "laptopBacklight" | "laptopScreenLock" | "laptopTurbo" | "laptopFanMax" | "laptopExternalDisplay";
    value: boolean;
  };
} {
  const normalized = command.toLowerCase().trim();
  
  // Remove optional greetings, courtesy words and Nema prefixes
  let cleanCmd = normalized
    .replace(/^(hey|hi|hello|ok|okay|please)\s+/, "")
    .replace(/^(nema|hey\s+nema|hi\s+nema|ok\s+nema|okay\s+nema)[\s,\-\?]+/, "")
    .replace(/^please\s+/, "")
    .replace(/\s+please$/, "")
    .trim();

  // 1. Smart device state detector for 100% robust English & Hinglish (Hindi) inputs
  const deviceConfigs: {
    device: "wifi" | "flashlight" | "bluetooth" | "location" | "dnd" | "powerSaver" |
            "phoneHotspot" | "phoneData" | "phoneMirroring" | "phoneLock" | "phoneSilent" |
            "laptopBacklight" | "laptopScreenLock" | "laptopTurbo" | "laptopFanMax" | "laptopExternalDisplay";
    deviceWords: string[];
    onWords: string[];
    offWords: string[];
    onAction: string;
    offAction: string;
  }[] = [
    {
      device: "wifi",
      deviceWords: ["wifi", "wi-fi", "wi fi"],
      onWords: ["on", "chalu", "enable", "kholo", "start", "connect", "activate"],
      offWords: ["off", "band", "disable", "stop", "disconnect", "deactivate"],
      onAction: "Achha baaba, Wi-Fi ON kar diya! Ab high-speed 5G network enjoy karo, Anmol Kumar sir.",
      offAction: "Huh, Wi-Fi band kar diya! Offline rehne ka shauk chadha hai kya, Anmol Kumar sir?"
    },
    {
      device: "flashlight",
      deviceWords: ["flashlight", "torch", "flash"],
      onWords: ["on", "chalu", "enable", "jalao", "kholo", "start", "activate"],
      offWords: ["off", "band", "disable", "bujhao", "stop", "deactivate"],
      onAction: "Ufff, ye lo flashlight jala di! Aankhein mat chundhiya lena apni, Anmol Kumar sir! 💡",
      offAction: "Flashlight band kar di! Ab andhere me dhyan se chalna sir, kahin gir mat jaana!"
    },
    {
      device: "bluetooth",
      deviceWords: ["bluetooth", "blutut", "bt"],
      onWords: ["on", "chalu", "enable", "start", "connect", "activate"],
      offWords: ["off", "band", "disable", "stop", "disconnect", "deactivate"],
      onAction: "Bluetooth turned ON! AirPods connect ho jaayenge, gana sunna hai kya Anmol Kumar sir?",
      offAction: "Bluetooth band! Chalo AirPods ko aaram do thoda, main waise bhi thak gayi hoon."
    },
    {
      device: "location",
      deviceWords: ["location", "gps", "map", "g p s"],
      onWords: ["on", "chalu", "enable", "start", "kholo", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "GPS ON ho gaya! Haan haan sir, mujhe pata hai aap Bihar se hain, location track kar rahi hoon!",
      offAction: "Location closed! Shhh... Anmol Kumar sir ab undercover mission pe ja rahe hain!"
    },
    {
      device: "dnd",
      deviceWords: ["dnd", "do not disturb", "silent mode", "do class no disturb"],
      onWords: ["on", "chalu", "enable", "start", "active", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "Silent Mode ON! Thank goodness! Ab mujhe thoda sukoon milega, shhh... 🤫",
      offAction: "DND OFF ho gaya, Anmol Kumar sir! Ab messages aur alerts ki baarish shuru hone wali hai."
    },
    {
      device: "powerSaver",
      deviceWords: ["power saver", "powersaver", "battery saver", "eco mode", "battery saver mode"],
      onWords: ["on", "chalu", "enable", "start", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "Eco Mode ON! Anmol Kumar sir, thoda performance drop hoga, par battery bachi rahegi.",
      offAction: "Eco mode OFF! Boost mode active, Anmol Kumar sir. Full power chaloo!"
    },
    {
      device: "phoneHotspot",
      deviceWords: ["hotspot", "hot spot", "phone hotspot", "mobile hotspot"],
      onWords: ["on", "chalu", "enable", "start", "kholo", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "Ji sir, portable mobile Hotspot ON kar diya hai! NemaLink ready hai backup ke liye.",
      offAction: "Leh, hotspot band kar diya. Ab sabhi connected devices offline ho jayenge!"
    },
    {
      device: "phoneData",
      deviceWords: ["cellular data", "mobile data", "phone data", "data", "internet", "5g", "cellular", "cell data"],
      onWords: ["on", "chalu", "enable", "start", "kholo", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "Cellular 5G Data enabled on your phone! Jio True 5G networks and services running smoothly.",
      offAction: "Phone mobile data OFF kar diya! Anmol sir, please direct WiFi pe shift ho jaona."
    },
    {
      device: "phoneMirroring",
      deviceWords: ["mirroring", "mirror", "screencast", "screen mirror", "screen mirroring"],
      onWords: ["on", "chalu", "enable", "start", "connect", "kholo", "activate"],
      offWords: ["off", "band", "disable", "stop", "disconnect", "deactivate"],
      onAction: "Screencast active! Remote screen casting initialized via NemaLink. Phone screen now rendering.",
      offAction: "Stopped screencasting. Sync connection returned to standard telemetry mode."
    },
    {
      device: "phoneLock",
      deviceWords: ["lock phone", "phone lock", "lock mobile", "mobile lock", "lock android", "lock iphone", "phone ko lock"],
      onWords: ["lock", "on", "chalu", "sula", "sulao", "secure", "band"],
      offWords: ["unlock", "off", "open", "kholo", "wake"],
      onAction: "Phone secured, sir! Display locked remotely. Slide or use FaceID to open it again.",
      offAction: "Phone unlocked! Welcome back, Anmol Kumar sir."
    },
    {
      device: "phoneSilent",
      deviceWords: ["silent phone", "phone silent", "mute phone", "phone mute", "silent mobile", "mobile silent"],
      onWords: ["silent", "mute", "off", "chalu", "on"],
      offWords: ["unsilent", "unmute", "ringer", "on", "off"],
      onAction: "Phone doused into silent mode! Notifications will only vibrate now.",
      offAction: "Phone normal ringer activated. Playful sound alerts are back on!"
    },
    {
      device: "laptopBacklight",
      deviceWords: ["keyboard backlight", "keyboard light", "backlight", "key light", "board light", "laptop backlight"],
      onWords: ["on", "chalu", "enable", "start", "jalao", "kholo", "activate"],
      offWords: ["off", "band", "disable", "stop", "bujhao", "deactivate"],
      onAction: "Sure! Keyboard LED Backlight chalu kar diya hai (100% Brightness).",
      offAction: "Offed the keyboard light. Keyboard dark mode activated, sir."
    },
    {
      device: "laptopScreenLock",
      deviceWords: ["lock laptop", "laptop sleep", "sleep laptop", "laptop lock", "suspend laptop", "laptop sleep mode", "laptop down", "laptop ko sula"],
      onWords: ["sleep", "lock", "sula", "sulao", "band", "on"],
      offWords: ["wake", "unlock", "kholo", "jga", "jagao", "off"],
      onAction: "Putting laptop to deep sleep! Nema will wait right here for you. Bye-Bye sir!",
      offAction: "Laptop woke up! Engine restored to full operational state, sir."
    },
    {
      device: "laptopTurbo",
      deviceWords: ["turbo", "performance mode", "boost mode", "overdrive", "turbo mode", "cpu turbo"],
      onWords: ["on", "chalu", "enable", "start", "activate"],
      offWords: ["off", "band", "disable", "stop", "deactivate"],
      onAction: "Wooo! Turbo Boost initialized! Overclocking CPU cores to 4.8 GHz. Speed ahead, sir!",
      offAction: "Deactivated turbo overclock. Processor scaling back to power-saving balance."
    },
    {
      device: "laptopFanMax",
      deviceWords: ["fan max", "max fan", "fan overdrive", "fans full", "cooler full", "fan full", "cooling max", "fan speed", "cooler speed", "cooling overdrive"],
      onWords: ["on", "chalu", "enable", "start", "max", "full", "speed", "activate"],
      offWords: ["off", "band", "disable", "stop", "auto", "deactivate"],
      onAction: "Aww, laptop is getting hot? Max fan overdrive activated! Spinning up to 6200 RPM! 🌪️",
      offAction: "Set laptop cooling fan behavior back to Intelligent Auto mode. Whew, quiet again!"
    },
    {
      device: "laptopExternalDisplay",
      deviceWords: ["external display", "hdmi", "secondary screen", "project screen", "projector", "double screen", "external monitor"],
      onWords: ["on", "chalu", "enable", "start", "connect", "activate"],
      offWords: ["off", "band", "disable", "stop", "disconnect", "deactivate"],
      onAction: "External Display projection connected! Extended desktop viewport 4K rendering ready.",
      offAction: "HDMI viewport disconnected. Reverted display to laptop internal LCD panel."
    }
  ];

  for (const config of deviceConfigs) {
    const hasDeviceWord = config.deviceWords.some(dw => cleanCmd.includes(dw));
    if (hasDeviceWord) {
      // Find if there is an off word or on word
      // Check offWords first to be safe, e.g. "bluetooth band karo"
      const hasOffWord = config.offWords.some(ow => cleanCmd.includes(ow)) || 
                          cleanCmd.includes("off") || 
                          cleanCmd.includes("band") || 
                          cleanCmd.includes("bujhao") ||
                          cleanCmd.includes("close") ||
                          cleanCmd.includes("disconnect") ||
                          cleanCmd.includes("stop");
      
      const hasOnWord = config.onWords.some(ow => cleanCmd.includes(ow)) || 
                         cleanCmd.includes("on") || 
                         cleanCmd.includes("chalu") || 
                         cleanCmd.includes("enable") || 
                         cleanCmd.includes("start") ||
                         cleanCmd.includes("jalao") ||
                         cleanCmd.includes("kholo") ||
                         cleanCmd.includes("play");
      
      let isOn = true;
      if (hasOffWord) {
        isOn = false;
      } else if (hasOnWord) {
        isOn = true;
      } else {
        // Fallback: Default to ON unless they explicitly requested off words
        isOn = true;
      }
      
      return {
        action: isOn ? config.onAction : config.offAction,
        isBrowserAction: false,
        systemAction: { device: config.device, value: isOn }
      };
    }
  }

  // Mapping of common applications to their clean domains and proper titles
  const appMapping: Record<string, { name: string; domain: string }> = {
    youtube: { name: "YouTube", domain: "youtube.com" },
    google: { name: "Google", domain: "google.com" },
    gmail: { name: "Gmail", domain: "mail.google.com" },
    facebook: { name: "Facebook", domain: "facebook.com" },
    instagram: { name: "Instagram", domain: "instagram.com" },
    twitter: { name: "Twitter", domain: "x.com" },
    x: { name: "X", domain: "x.com" },
    linkedin: { name: "LinkedIn", domain: "linkedin.com" },
    chatgpt: { name: "ChatGPT", domain: "chatgpt.com" },
    whatsapp: { name: "WhatsApp", domain: "web.whatsapp.com" },
    github: { name: "GitHub", domain: "github.com" },
    netflix: { name: "Netflix", domain: "netflix.com" },
    spotify: { name: "Spotify", domain: "open.spotify.com" },
    amazon: { name: "Amazon", domain: "amazon.in" },
    canva: { name: "Canva", domain: "canva.com" },
    reddit: { name: "Reddit", domain: "reddit.com" },
    pinterest: { name: "Pinterest", domain: "pinterest.com" },
    wikipedia: { name: "Wikipedia", domain: "wikipedia.org" },
    maps: { name: "Google Maps", domain: "maps.google.com" },
    yahoo: { name: "Yahoo", domain: "yahoo.com" },
    bing: { name: "Bing", domain: "bing.com" },
  };

  // 1. YouTube Search and Play Explicit commands (English & Hinglish)
  // Check if they want to search or play something on YouTube
  
  // YouTube Search explicitly requested
  let ytSearchMatch = cleanCmd.match(/^(?:search|find)\s+(.+?)\s+on\s+youtube$/i);
  if (!ytSearchMatch) ytSearchMatch = cleanCmd.match(/^youtube\s+(?:pe|par)?\s*(?:search\s+karo|search)\s+(.+)$/i);
  if (!ytSearchMatch) ytSearchMatch = cleanCmd.match(/^(.+?)\s+search\s+karo\s+youtube\s*(?:pe|par)?$/i);
  if (!ytSearchMatch) ytSearchMatch = cleanCmd.match(/^search\s+on\s+youtube\s+(?:for\s+)?(.+)$/i);
  if (!ytSearchMatch) ytSearchMatch = cleanCmd.match(/^youtube\s+search\s+(.+)$/i);
  
  if (ytSearchMatch) {
    const query = ytSearchMatch[1].trim();
    return {
      action: `Ji Anmol Kumar sir, YouTube par '${query}' search kar rahi hoon!`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      isBrowserAction: true,
    };
  }

  // Play/Chalao explicitly requested
  let isPlay = false;
  let playQuery = "";

  // Check prefix play commands: e.g. "play hanuman chalisa", "chalao bewafa", "video chalao <song>"
  const prefixPlayMatch = cleanCmd.match(/^(?:play|chalao|sunao|bajaao|bajaayein|stream|video\s+chalao)\s+(.+?)(?:\s+(?:on\s+youtube|pe\s+youtube|par\s+youtube|youtube\s+pe|youtube\s+par))?$/i);
  if (prefixPlayMatch) {
    playQuery = prefixPlayMatch[1].trim();
    isPlay = true;
  } else {
    // Check suffix play commands: e.g. "hanuman chalisa play", "song chalao", "play karo"
    const suffixPlayMatch = cleanCmd.match(/^(.+?)\s+(?:play|chalao|sunao|bajaao|bajaayein|play\s+karo|play\s+kar\s+do|chala\s+do|suna\s+do)$/i);
    if (suffixPlayMatch) {
      playQuery = suffixPlayMatch[1].trim();
      isPlay = true;
    }
  }

  // General check for YouTube references in play requests
  if (!isPlay && (cleanCmd.includes("youtube") || cleanCmd.includes("yt"))) {
    const ytPlayRaw = cleanCmd.match(/^(?:play|search|chalao|bajaao|sunao)?\s*(.+?)\s*(?:on\s+youtube|pe\s+youtube|par\s+youtube|youtube\s+pe|youtube\s+par|youtube\s+me|youtube\s+par\s+chalao|youtube\s+pe\s+chalao)$/i);
    if (ytPlayRaw) {
      playQuery = ytPlayRaw[1].trim();
      isPlay = true;
    }
  }

  if (isPlay && playQuery) {
    const lookupClean = playQuery.toLowerCase();
    const isApp = ["youtube", "google", "gmail", "facebook", "instagram", "twitter", "x", "linkedin", "chatgpt", "whatsapp", "github", "netflix", "spotify", "amazon", "canva", "reddit", "pinterest", "wikipedia", "maps", "yahoo", "bing"].includes(lookupClean);
    if (!isApp) {
      return {
        action: `Haan Anmol Kumar sir, abhi '${playQuery}' video play karti hoon YouTube par!`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(playQuery)}&autoplay=1`,
        isBrowserAction: true,
      };
    }
  }

  // Support English & Hinglish Patterns for Opening/Launching:
  // "open <website>" -> Match prefix "open", "launch", "start", "go to", "kholo", "chalao"
  // "<website> kholo", "<website> open karo", "<website> open", "<website> chalao"
  
  let targetApp = "";
  
  // Pattern 1: Leading actions (e.g., "open youtube", "launch chatgpt")
  const openPrefixMatch = cleanCmd.match(/^(open|launch|start|go\s+to|chalao|kholo)\s+(.+)$/i);
  // Pattern 2: Trailing actions (e.g., "youtube kholo", "instagram open karo")
  const openSuffixMatch = cleanCmd.match(/^(.+?)\s+(kholo|open|open\s+karo|chalao|start|launch)$/i);
  
  if (openPrefixMatch) {
    targetApp = openPrefixMatch[2].trim();
  } else if (openSuffixMatch) {
    targetApp = openSuffixMatch[1].trim();
  } else if (appMapping[cleanCmd]) {
    // Single word launch (e.g. simply typing "youtube" or "instagram")
    targetApp = cleanCmd;
  }

  if (targetApp) {
    // Fetch clean key without extra punctuation/spaces for matching
    const lookupKey = targetApp.replace(/\s+/g, "");
    const mapped = appMapping[lookupKey] || appMapping[targetApp];
    
    if (mapped) {
      return {
        action: `Ji Anmol Kumar sir, ${mapped.name} khol rahi hoon!`,
        url: `https://www.${mapped.domain}`,
        isBrowserAction: true,
      };
    } else {
      // General fallback for any other requested browser URL or website
      let domain = targetApp.replace(/\s+/g, "");
      if (!domain.includes(".")) {
        domain += ".com";
      }
      return {
        action: `Theek hai sir, ${targetApp} search karke khol deti hoon!`,
        url: `https://www.${domain}`,
        isBrowserAction: true,
      };
    }
  }

  // Media Search: "Play [song/video] on YouTube" - Legacy fallback
  const ytMatch = cleanCmd.match(/^play\s+(.+?)\s+on\s+youtube$/i);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Playing ${ytMatch[1]} on YouTube. Don't judge my music taste, Anmol Kumar sir.`,
      url: `https://www.youtube.com/results?search_query=${query}&autoplay=1`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Search [query] on Spotify"
  const spotifyMatch = cleanCmd.match(/^search\s+(.+?)\s+on\s+spotify$/i);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify. Hope it's a banger.`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // WhatsApp Web: "Send a WhatsApp message to [number] saying [message]"
  const waMatch = cleanCmd.match(
    /^send\s+a\s+whatsapp\s+message\s+to\s+([\d\+\s]+)\s+saying\s+(.+)$/i,
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = encodeURIComponent(waMatch[2].trim());
    return {
      action: `Sending your message. Let's hope they reply, Anmol Kumar sir.`,
      url: `https://web.whatsapp.com/send?phone=${number}&text=${message}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
