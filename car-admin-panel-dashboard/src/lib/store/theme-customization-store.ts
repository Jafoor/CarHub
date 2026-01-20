import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LayoutSize = "compact" | "normal" | "comfortable";
export type ThemePreset =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "custom";

interface ThemeCustomizationState {
  // Color customization
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Theme preset
  themePreset: ThemePreset;

  // Layout size
  layoutSize: LayoutSize;

  // Actions
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setLayoutSize: (size: LayoutSize) => void;
  resetToDefault: () => void;
}

const defaultColors = {
  default: {
    primary: "210 80% 45%",
    secondary: "0 0% 96%",
    accent: "0 0% 18%",
  },
  blue: {
    primary: "210 80% 45%",
    secondary: "0 0% 96%",
    accent: "210 80% 55%",
  },
  green: {
    primary: "142.1 76.2% 36.3%",
    secondary: "0 0% 96%",
    accent: "142.1 70.6% 45.3%",
  },
  purple: {
    primary: "262.1 83.3% 57.8%",
    secondary: "0 0% 96%",
    accent: "262.1 80.5% 64.9%",
  },
  orange: {
    primary: "24.6 95% 53.1%",
    secondary: "0 0% 96%",
    accent: "24.6 90% 58.3%",
  },
  red: {
    primary: "0 72.2% 50.6%",
    secondary: "0 0% 96%",
    accent: "0 84.2% 60.2%",
  },
  custom: {
    primary: "210 80% 45%",
    secondary: "0 0% 96%",
    accent: "0 0% 18%",
  },
};

export const useThemeCustomizationStore = create<ThemeCustomizationState>()(
  persist(
    (set, get) => ({
      primaryColor: defaultColors.default.primary,
      secondaryColor: defaultColors.default.secondary,
      accentColor: defaultColors.default.accent,
      themePreset: "default",
      layoutSize: "normal",

      setPrimaryColor: (color) => {
        set({ primaryColor: color, themePreset: "custom" });
        applyCustomColors(color, get().secondaryColor, get().accentColor);
      },

      setSecondaryColor: (color) => {
        set({ secondaryColor: color, themePreset: "custom" });
        applyCustomColors(get().primaryColor, color, get().accentColor);
      },

      setAccentColor: (color) => {
        set({ accentColor: color, themePreset: "custom" });
        applyCustomColors(get().primaryColor, get().secondaryColor, color);
      },

      setThemePreset: (preset) => {
        const colors = defaultColors[preset];
        set({
          themePreset: preset,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
        });
        applyCustomColors(colors.primary, colors.secondary, colors.accent);
      },

      setLayoutSize: (size) => {
        set({ layoutSize: size });
        applyLayoutSize(size);
      },

      resetToDefault: () => {
        const colors = defaultColors.default;
        set({
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
          themePreset: "default",
          layoutSize: "normal",
        });
        applyCustomColors(colors.primary, colors.secondary, colors.accent);
        applyLayoutSize("normal");
      },
    }),
    {
      name: "theme-customization-storage",
      onRehydrateStorage: () => (state) => {
        // Only apply on client side after hydration
        if (state && typeof window !== "undefined") {
          // Use setTimeout to ensure this runs after hydration
          setTimeout(() => {
            applyCustomColors(
              state.primaryColor,
              state.secondaryColor,
              state.accentColor,
            );
            applyLayoutSize(state.layoutSize);
          }, 0);
        }
      },
    },
  ),
);

function applyCustomColors(primary: string, secondary: string, accent: string) {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--ring", primary);
  }
}

function applyLayoutSize(size: LayoutSize) {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const sizes = {
      compact: { spacing: "0.25rem", radius: "0.25rem", fontSize: "0.875rem" },
      normal: { spacing: "0.5rem", radius: "0.5rem", fontSize: "1rem" },
      comfortable: {
        spacing: "0.75rem",
        radius: "0.75rem",
        fontSize: "1.125rem",
      },
    };

    const config = sizes[size];
    root.style.setProperty("--radius", config.radius);
    root.classList.remove(
      "layout-compact",
      "layout-normal",
      "layout-comfortable",
    );
    root.classList.add(`layout-${size}`);
  }
}

// Don't initialize here - let ThemeInitializer handle it on client side
