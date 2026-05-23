export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
  systemAction?: {
    device: "wifi" | "flashlight" | "bluetooth" | "location" | "dnd" | "powerSaver";
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

  // 1. WiFi Simulated Controls
  if (cleanCmd.match(/^(wifi|wi-fi)\s*(on|chalu|enable|turn\s+on|kholo|on\s+karo|chalu\s+karo)$/i) || 
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo|kholo)\s*(wifi|wi-fi)$/i)) {
    return {
      action: "Achha baaba, Wi-Fi ON kar diya! Ab high-speed 5G network enjoy karo, Anmol Kumar sir.",
      isBrowserAction: false,
      systemAction: { device: "wifi", value: true }
    };
  }
  if (cleanCmd.match(/^(wifi|wi-fi)\s*(off|band|disable|turn\s+off|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo)\s*(wifi|wi-fi)$/i)) {
    return {
      action: "Huh, Wi-Fi band kar diya! Offline rehne ka shauk chadha hai kya, Anmol Kumar sir?",
      isBrowserAction: false,
      systemAction: { device: "wifi", value: false }
    };
  }

  // 2. Flashlight Simulated Controls
  if (cleanCmd.match(/^(flashlight|torch|flash)\s*(on|chalu|enable|turn\s+on|jalao|on\s+karo|chalu\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo|jalao)\s*(flashlight|torch|flash)$/i)) {
    return {
      action: "Ufff, ye lo flashlight jala di! Aankhein mat chundhiya lena apni, Anmol Kumar sir! 💡",
      isBrowserAction: false,
      systemAction: { device: "flashlight", value: true }
    };
  }
  if (cleanCmd.match(/^(flashlight|torch|flash)\s*(off|band|disable|turn\s+off|bujhao|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo|bujhao)\s*(flashlight|torch|flash)$/i)) {
    return {
      action: "Flashlight band kar di! Ab andhere me dhyan se chalna sir, kahin gir mat jaana!",
      isBrowserAction: false,
      systemAction: { device: "flashlight", value: false }
    };
  }

  // 3. Bluetooth Simulated Controls
  if (cleanCmd.match(/^(bluetooth)\s*(on|chalu|enable|turn\s+on|on\s+karo|chalu\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo)\s*(bluetooth)$/i)) {
    return {
      action: "Bluetooth turned ON! AirPods connect ho jaayenge, gana sunna hai kya Anmol Kumar sir?",
      isBrowserAction: false,
      systemAction: { device: "bluetooth", value: true }
    };
  }
  if (cleanCmd.match(/^(bluetooth)\s*(off|band|disable|turn\s+off|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo)\s*(bluetooth)$/i)) {
    return {
      action: "Bluetooth band! Chalo AirPods ko aaram do thoda, main waise bhi thak gayi hoon.",
      isBrowserAction: false,
      systemAction: { device: "bluetooth", value: false }
    };
  }

  // 4. Location Simulated Controls
  if (cleanCmd.match(/^(location|gps|map)\s*(on|chalu|enable|turn\s+on|on\s+karo|chalu\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo)\s*(location|gps)$/i)) {
    return {
      action: "GPS ON ho gaya! Haan haan sir, mujhe pata hai aap Bihar se hain, location track kar rahi hoon!",
      isBrowserAction: false,
      systemAction: { device: "location", value: true }
    };
  }
  if (cleanCmd.match(/^(location|gps|map)\s*(off|band|disable|turn\s+off|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo)\s*(location|gps)$/i)) {
    return {
      action: "Location closed! Shhh... Anmol Kumar sir ab undercover mission pe ja rahe hain!",
      isBrowserAction: false,
      systemAction: { device: "location", value: false }
    };
  }

  // 5. Do Not Disturb (DND) / Silent Controls
  if (cleanCmd.match(/^(dnd|silent|do\s+not\s+disturb)\s*(on|chalu|enable|turn\s+on|on\s+karo|chalu\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo)\s*(dnd|silent|do\s+not\s+disturb)$/i)) {
    return {
      action: "Silent Mode ON! Thank goodness! Ab mujhe thoda sukoon milega, shhh... 🤫",
      isBrowserAction: false,
      systemAction: { device: "dnd", value: true }
    };
  }
  if (cleanCmd.match(/^(dnd|silent|do\s+not\s+disturb)\s*(off|band|disable|turn\s+off|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo)\s*(dnd|silent|do\s+not\s+disturb)$/i)) {
    return {
      action: "DND OFF ho gaya, Anmol Kumar sir! Ab messages aur alerts ki baarish shuru hone wali hai.",
      isBrowserAction: false,
      systemAction: { device: "dnd", value: false }
    };
  }

  // 6. Power Saver simulated controls
  if (cleanCmd.match(/^(power\s*saver|battery\s*saver|eco\s*mode|battery)\s*(on|chalu|enable|turn\s+on|on\s+karo|chalu\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+on|enable|chalu\s+karo)\s*(power\s*saver|battery\s*saver|eco\s*mode)$/i)) {
    return {
      action: "Eco Mode ON! Anmol Kumar sir, thoda performance drop hoga, par battery bachi rahegi.",
      isBrowserAction: false,
      systemAction: { device: "powerSaver", value: true }
    };
  }
  if (cleanCmd.match(/^(power\s*saver|battery\s*saver|eco\s*mode|battery)\s*(off|band|disable|turn\s+off|band\s+karo)$/i) ||
      cleanCmd.match(/^(turn\s+off|disable|band\s+karo)\s*(power\s*saver|battery\s*saver|eco\s*mode)$/i)) {
    return {
      action: "Eco mode OFF! Boost mode active, Anmol Kumar sir. Full power chaloo!",
      isBrowserAction: false,
      systemAction: { device: "powerSaver", value: false }
    };
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
