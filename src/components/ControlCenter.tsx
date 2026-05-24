import React, { useEffect, useState } from "react";
import { 
  Wifi, 
  WifiOff, 
  Flashlight, 
  Bluetooth, 
  MapPin, 
  Moon, 
  Battery, 
  BatteryCharging,
  Cpu,
  Compass,
  Laptop,
  Smartphone,
  Radio,
  Tv,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Keyboard,
  Wind,
  Monitor,
  Flame,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface DeviceState {
  wifi: boolean;
  flashlight: boolean;
  bluetooth: boolean;
  location: boolean;
  dnd: boolean;
  powerSaver: boolean;
  
  // Phone Sync simulation
  phoneHotspot: boolean;
  phoneData: boolean;
  phoneMirroring: boolean;
  phoneLock: boolean;
  phoneSilent: boolean;
  
  // Laptop Control simulation
  laptopBacklight: boolean;
  laptopScreenLock: boolean;
  laptopTurbo: boolean;
  laptopFanMax: boolean;
  laptopExternalDisplay: boolean;
}

interface ControlCenterProps {
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
}

export default function ControlCenter({ deviceState, setDeviceState }: ControlCenterProps) {
  const [activeTab, setActiveTab] = useState<"console" | "phone" | "laptop">("console");
  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  // Try to use real battery status from browser if available
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

  const toggleState = (key: keyof DeviceState) => {
    setDeviceState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full flex flex-col gap-3 pointer-events-auto h-full overflow-y-auto no-scrollbar scroll-smooth pr-1">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-mono font-medium tracking-widest text-white/40 uppercase">
          Dynamic Control Deck
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          MULTI-SYNC CONNECTED
        </span>
      </div>

      {/* Segmented Device Selector Tab */}
      <div className="grid grid-cols-3 bg-white/[0.02] border border-white/5 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab("console")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
            activeTab === "console"
              ? "bg-violet-500/10 border border-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
              : "border border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <Cpu size={13} />
          <span>Console</span>
        </button>
        <button
          onClick={() => setActiveTab("phone")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
            activeTab === "phone"
              ? "bg-sky-500/10 border border-sky-500/20 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.05)]"
              : "border border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <Smartphone size={13} />
          <span>Phone</span>
        </button>
        <button
          onClick={() => setActiveTab("laptop")}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg font-medium transition-all duration-300 ${
            activeTab === "laptop"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
              : "border border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <Laptop size={13} />
          <span>Laptop</span>
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {/* TAB 1: CONSOLE */}
          {activeTab === "console" && (
            <motion.div
              key="console"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {/* Wi-Fi Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-wifi-toggle"
                onClick={() => toggleState("wifi")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.wifi 
                    ? "bg-violet-500/10 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.wifi && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-violet-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.wifi ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30"}`}>
                    {deviceState.wifi ? <Wifi size={16} /> : <WifiOff size={16} />}
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.wifi ? "bg-violet-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.wifi ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Wi-Fi Network</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.wifi ? "Anmol_Wifi_5G" : "Disconnected"}
                  </p>
                </div>
              </motion.button>

              {/* Flashlight Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-flashlight-toggle"
                onClick={() => toggleState("flashlight")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.flashlight 
                    ? "bg-amber-500/10 border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.flashlight && (
                  <motion.span 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -right-3 -top-3 w-12 h-12 bg-amber-500/20 blur-xl rounded-full" 
                  />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.flashlight ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/30"}`}>
                    <Flashlight size={16} className={deviceState.flashlight ? "animate-pulse" : ""} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.flashlight ? "bg-amber-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.flashlight ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Flashlight</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.flashlight ? "Torch Active" : "In Darkness"}
                  </p>
                </div>
              </motion.button>

              {/* Bluetooth Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-bluetooth-toggle"
                onClick={() => toggleState("bluetooth")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.bluetooth 
                    ? "bg-sky-500/10 border-sky-500/30 text-white shadow-[0_0_15px_rgba(56,189,248,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.bluetooth && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-sky-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.bluetooth ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-white/30"}`}>
                    <Bluetooth size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.bluetooth ? "bg-sky-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.bluetooth ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Bluetooth</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.bluetooth ? "Synced Units" : "Disabled"}
                  </p>
                </div>
              </motion.button>

              {/* Location (GPS) Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-location-toggle"
                onClick={() => toggleState("location")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.location 
                    ? "bg-rose-500/10 border-rose-500/30 text-white shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.location && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-rose-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.location ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/30"}`}>
                    <MapPin size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.location ? "bg-rose-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.location ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Location (GPS)</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.location ? "Patna, Bihar" : "Hidden"}
                  </p>
                </div>
              </motion.button>

              {/* Do Not Disturb (DND) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-dnd-toggle"
                onClick={() => toggleState("dnd")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.dnd 
                    ? "bg-indigo-500/10 border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.dnd && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-indigo-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.dnd ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/30"}`}>
                    <Moon size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.dnd ? "bg-indigo-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.dnd ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Silent Mode</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.dnd ? "DND Active" : "Alerts On"}
                  </p>
                </div>
              </motion.button>

              {/* Power Saver Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-powersaver-toggle"
                onClick={() => toggleState("powerSaver")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.powerSaver 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.powerSaver && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-emerald-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.powerSaver ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                    <Cpu size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.powerSaver ? "bg-emerald-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.powerSaver ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Power Saver</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.powerSaver ? "Battery Saver" : "Performance Mode"}
                  </p>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* TAB 2: PHONE CONNECT */}
          {activeTab === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {/* Hotspot Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-phone-hotspot"
                onClick={() => toggleState("phoneHotspot")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.phoneHotspot 
                    ? "bg-sky-500/10 border-sky-500/30 text-white shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.phoneHotspot && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-sky-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.phoneHotspot ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-white/30"}`}>
                    <Radio size={16} className={deviceState.phoneHotspot ? "animate-pulse" : ""} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.phoneHotspot ? "bg-sky-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.phoneHotspot ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Mobile Hotspot</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.phoneHotspot ? "Broadcasting NemaLink" : "Inactive"}
                  </p>
                </div>
              </motion.button>

              {/* Cellular 5G Data */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-phone-data"
                onClick={() => toggleState("phoneData")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.phoneData 
                    ? "bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.phoneData && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-blue-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.phoneData ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/30"}`}>
                    <Smartphone size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.phoneData ? "bg-blue-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.phoneData ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Cellular 5G</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.phoneData ? "Jio True 5G Active" : "Disconnected"}
                  </p>
                </div>
              </motion.button>

              {/* Phone Mirroring */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-phone-mirroring"
                onClick={() => toggleState("phoneMirroring")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.phoneMirroring 
                    ? "bg-pink-500/10 border-pink-500/30 text-white shadow-[0_0_15px_rgba(236,72,153,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.phoneMirroring && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-pink-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.phoneMirroring ? "bg-pink-500/20 text-pink-400" : "bg-white/5 text-white/30"}`}>
                    <Tv size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.phoneMirroring ? "bg-pink-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.phoneMirroring ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Screen Mirrored</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.phoneMirroring ? "Casting to Desk..." : "Idle"}
                  </p>
                </div>
              </motion.button>

              {/* Screen Lock state */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-phone-lock"
                onClick={() => toggleState("phoneLock")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.phoneLock 
                    ? "bg-rose-500/10 border-rose-500/30 text-white shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.phoneLock && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-rose-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.phoneLock ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/30"}`}>
                    {deviceState.phoneLock ? <Lock size={16} /> : <Unlock size={16} />}
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.phoneLock ? "bg-rose-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.phoneLock ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Phone Remotely Locked</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.phoneLock ? "Device Secured" : "Unlocked"}
                  </p>
                </div>
              </motion.button>

              {/* Ringer Mode */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-phone-silent"
                onClick={() => toggleState("phoneSilent")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.phoneSilent 
                    ? "bg-amber-500/10 border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.phoneSilent && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-amber-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.phoneSilent ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/30"}`}>
                    {deviceState.phoneSilent ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.phoneSilent ? "bg-amber-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.phoneSilent ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Phone Silent Mode</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.phoneSilent ? "Total Silence" : "Normal Ringer"}
                  </p>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* TAB 3: LAPTOP SYSTEM ENGINE */}
          {activeTab === "laptop" && (
            <motion.div
              key="laptop"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              {/* Keyboard Backlight */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-laptop-backlight"
                onClick={() => toggleState("laptopBacklight")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.laptopBacklight 
                    ? "bg-amber-500/10 border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.laptopBacklight && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-amber-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.laptopBacklight ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/30"}`}>
                    <Keyboard size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.laptopBacklight ? "bg-amber-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.laptopBacklight ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Keyboard Backlight</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.laptopBacklight ? "Full LED Mode (100%)" : "LED Off"}
                  </p>
                </div>
              </motion.button>

              {/* Turbo engine Mode */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-laptop-turbo"
                onClick={() => toggleState("laptopTurbo")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.laptopTurbo 
                    ? "bg-rose-500/10 border-rose-500/30 text-white shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.laptopTurbo && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-rose-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.laptopTurbo ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/30"}`}>
                    <Flame size={16} className={deviceState.laptopTurbo ? "animate-pulse" : ""} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.laptopTurbo ? "bg-rose-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.laptopTurbo ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">CPU Turbo Engine</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.laptopTurbo ? "Boost 4.8 GHz Liquid Metal" : "Balanced Profile"}
                  </p>
                </div>
              </motion.button>

              {/* Fan Overdrive */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-laptop-fanmax"
                onClick={() => toggleState("laptopFanMax")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.laptopFanMax 
                    ? "bg-teal-500/10 border-teal-500/30 text-white shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.laptopFanMax && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-teal-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.laptopFanMax ? "bg-teal-500/20 text-teal-400" : "bg-white/5 text-white/30"}`}>
                    <Wind size={16} className={deviceState.laptopFanMax ? "animate-spin" : ""} style={{ animationDuration: "0.5s" }} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.laptopFanMax ? "bg-teal-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.laptopFanMax ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Fan Overdrive (RPM)</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.laptopFanMax ? "6200 RPM Jet Blast" : "Auto Acoustic Control"}
                  </p>
                </div>
              </motion.button>

              {/* Screen sleep / Lock Laptop */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-laptop-screenlock"
                onClick={() => toggleState("laptopScreenLock")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.laptopScreenLock 
                    ? "bg-red-500/10 border-red-500/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.laptopScreenLock && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-red-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.laptopScreenLock ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/30"}`}>
                    <Lock size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.laptopScreenLock ? "bg-red-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.laptopScreenLock ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">Laptop Sleep Engine</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.laptopScreenLock ? "System Sleeping" : "Engine Awake"}
                  </p>
                </div>
              </motion.button>

              {/* Project display external */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-laptop-externaldisplay"
                onClick={() => toggleState("laptopExternalDisplay")}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-[105px] justify-between ${
                  deviceState.laptopExternalDisplay 
                    ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-white shadow-[0_0_15px_rgba(217,70,239,0.1)]" 
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                {deviceState.laptopExternalDisplay && (
                  <span className="absolute -right-3 -top-3 w-12 h-12 bg-fuchsia-500/10 blur-xl rounded-full" />
                )}
                <div className="flex justify-between items-start w-full">
                  <div className={`p-1.5 rounded-lg ${deviceState.laptopExternalDisplay ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-white/5 text-white/30"}`}>
                    <Monitor size={16} />
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors duration-300 shrink-0 ${deviceState.laptopExternalDisplay ? "bg-fuchsia-500" : "bg-white/10"}`}>
                    <motion.div 
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                      animate={{ x: deviceState.laptopExternalDisplay ? 14 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">External HDMI Monitor</p>
                  <p className="text-[9px] opacity-60 font-mono truncate">
                    {deviceState.laptopExternalDisplay ? "Projecting 4K Extended" : "Single Screen Only"}
                  </p>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System Status Summary footer */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between text-white/60 text-[11px] font-mono mt-1">
        <div className="flex items-center gap-2">
          {isCharging ? (
            <BatteryCharging size={14} className="text-emerald-400 animate-pulse" />
          ) : (
            <Battery size={14} className="text-amber-400" />
          )}
          <span>Device batt: {batteryLevel}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Compass size={14} className={deviceState.location ? "animate-spin" : "opacity-40"} style={{ animationDuration: "12s" }} />
          <span>Active Nodes: {activeTab === "console" ? "6 WEB" : activeTab === "phone" ? "NEMALINK ACTIVE" : "CPU TURBOREADY"}</span>
        </div>
      </div>
    </div>
  );
}
