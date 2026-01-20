"use client";

import { useEffect } from "react";
import { useThemeCustomizationStore } from "@/lib/store/theme-customization-store";

export function ThemeInitializer() {
  const { primaryColor, secondaryColor, accentColor, layoutSize } = useThemeCustomizationStore();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--secondary", secondaryColor);
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--ring", primaryColor);

    // Apply layout size
    root.classList.remove("layout-compact", "layout-normal", "layout-comfortable");
    root.classList.add(`layout-${layoutSize}`);
  }, [primaryColor, secondaryColor, accentColor, layoutSize]);

  return null;
}
