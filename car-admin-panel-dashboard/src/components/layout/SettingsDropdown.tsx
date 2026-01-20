"use client";

import { useState } from "react";
import { Settings, Palette, Layout, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useThemeCustomizationStore, type ThemePreset, type LayoutSize } from "@/lib/store/theme-customization-store";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils/cn";

// Helper to convert HSL string (e.g., "221.2 83.2% 53.3%") to hex
function hslToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/);
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDecimal - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return "#3b82f6"; // Default blue
  }
}

// Helper to convert hex to HSL string
function hexToHsl(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return "221.2 83.2% 53.3%"; // Default
  }
}

const themePresets: { value: ThemePreset; label: string; color: string }[] = [
  { value: "default", label: "Default", color: "hsl(210, 80%, 45%)" },
  { value: "blue", label: "Blue", color: "hsl(210, 80%, 45%)" },
  { value: "green", label: "Green", color: "hsl(142.1, 76.2%, 36.3%)" },
  { value: "purple", label: "Purple", color: "hsl(262.1, 83.3%, 57.8%)" },
  { value: "orange", label: "Orange", color: "hsl(24.6, 95%, 53.1%)" },
  { value: "red", label: "Red", color: "hsl(0, 72.2%, 50.6%)" },
  { value: "custom", label: "Custom", color: "currentColor" },
];

export function SettingsDropdown() {
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    themePreset,
    layoutSize,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setThemePreset,
    setLayoutSize,
    resetToDefault,
  } = useThemeCustomizationStore();

  const { theme, setTheme } = useTheme();
  const primaryHex = hslToHex(primaryColor);
  const [isOpen, setIsOpen] = useState(false);

  const handlePrimaryColorChange = (hex: string) => {
    try {
      const hsl = hexToHsl(hex);
      setPrimaryColor(hsl);
    } catch (e) {
      // Ignore conversion errors
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefault}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Color Mode */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Mode
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Preset */}
          <div className="space-y-2">
            <Label>Theme Preset</Label>
            <div className="grid grid-cols-4 gap-2">
              {themePresets.slice(0, 6).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setThemePreset(preset.value)}
                  className={cn(
                    "h-10 rounded-md border-2 transition-all",
                    themePreset === preset.value
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{
                    backgroundColor: preset.color === "currentColor" ? undefined : preset.color,
                  }}
                  title={preset.label}
                />
              ))}
            </div>
            {themePreset === "custom" && (
              <div className="pt-2 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="primary-color" className="text-xs">
                    Primary Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryHex}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="h-10 w-20 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={primaryHex}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="flex-1 text-xs"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Layout Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Layout Size
            </Label>
            <Select value={layoutSize} onValueChange={(value) => setLayoutSize(value as LayoutSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
