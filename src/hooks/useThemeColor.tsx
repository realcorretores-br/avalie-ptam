import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { getThemeColorHSL } from "@/lib/theme-colors";

export const useThemeColor = () => {
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.theme_color) {
      const hslValue = getThemeColorHSL(profile.theme_color);

      // Aplicar a cor primária
      document.documentElement.style.setProperty('--primary', hslValue);

      // Calcular variações da cor para light e dark
      const [h, s, l] = hslValue.split(' ').map(v => parseFloat(v));

      // Primary light (aumentar luminosidade em 10%)
      const lightL = Math.min(100, l + 10);
      document.documentElement.style.setProperty('--primary-light', `${h} ${s}% ${lightL}%`);

      // Primary dark (diminuir luminosidade em 10%)
      const darkL = Math.max(0, l - 10);
      document.documentElement.style.setProperty('--primary-dark', `${h} ${s}% ${darkL}%`);

      // Ring color (mesma cor primária)
      document.documentElement.style.setProperty('--ring', hslValue);
    }
  }, [profile?.theme_color]);
};