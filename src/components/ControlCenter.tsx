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
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface DeviceState {
  wifi: boolean;
  flashlight: boolean;
  bluetooth: boolean;
  location: boolean;
  dnd: boolean;
  powerSaver: boolean;
}

interface ControlCenterProps {
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
}

export default function ControlCenter({ deviceState, setDeviceState }: ControlCenterProps) {
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
      // Simulation/fallback logic
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
    <div className="w-full flex flex-col gap-4 pointer-events-auto h-full overflow-y-auto no-scrollbar scroll-smooth pr-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
        <h3 className="text-xs font-mono font-medium tracking-widest text-white/40 uppercase">
          Device Control Deck
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          NEMA SYNCED
        </span>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-2 gap-3">
        
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
              {deviceState.wifi ? <Wifi size={18} /> : <WifiOff size={18} />}
            </div>
            
            {/* Phone Slide Switch */}
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
              <Flashlight size={18} className={deviceState.flashlight ? "animate-pulse" : ""} />
            </div>
            
            {/* Phone Slide Switch */}
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
              <Bluetooth size={18} />
            </div>
            
            {/* Phone Slide Switch */}
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
              {deviceState.bluetooth ? "AirPods Connect" : "Disabled"}
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
              <MapPin size={18} />
            </div>
            
            {/* Phone Slide Switch */}
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
              <Moon size={18} />
            </div>
            
            {/* Phone Slide Switch */}
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
              <Cpu size={18} />
            </div>
            
            {/* Phone Slide Switch */}
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
              {deviceState.powerSaver ? "Battery Saver" : "Boost Mode"}
            </p>
          </div>
        </motion.button>

      </div>

      {/* System Status Summary footer */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between text-white/60 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          {isCharging ? (
            <BatteryCharging size={14} className="text-emerald-400 animate-pulse" />
          ) : (
            <Battery size={14} className="text-amber-400" />
          )}
          <span>Battery: {batteryLevel}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Compass size={14} className={deviceState.location ? "animate-spin" : "opacity-40"} style={{ animationDuration: "12s" }} />
          <span>98 FPS • Core Temp: 37°C</span>
        </div>
      </div>
    </div>
  );
}
