export interface ThemeColor {
    name: string;
    value: string;
    hsl: string;
}

export const THEME_COLORS: ThemeColor[] = [
    { name: "Azul (Padrão)", value: "blue", hsl: "217 91% 60%" },
    { name: "Preto", value: "black", hsl: "220 9% 20%" },
    { name: "Cinza", value: "gray", hsl: "220 9% 46%" },
    { name: "Rosa Claro", value: "pink-light", hsl: "0 84% 81%" },
    { name: "Rosa", value: "pink", hsl: "326 78% 69%" },
    { name: "Vermelho", value: "red", hsl: "0 84% 60%" },
    { name: "Laranja", value: "orange", hsl: "25 95% 53%" },
    { name: "Amarelo", value: "yellow", hsl: "45 93% 58%" },
    { name: "Verde", value: "green", hsl: "158 64% 52%" },
    { name: "Verde Escuro", value: "green-dark", hsl: "160 84% 39%" },
    { name: "Ciano", value: "cyan", hsl: "189 94% 43%" },
    { name: "Roxo", value: "purple", hsl: "271 71% 66%" },
];

export const getThemeColorHSL = (colorName: string): string => {
    const color = THEME_COLORS.find(c => c.value === colorName);
    return color?.hsl || "217 91% 60%"; // default blue
};
