import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

<<<<<<< HEAD
import { THEME_COLORS } from "@/lib/theme-colors";
=======
interface ThemeColor {
  name: string;
  value: string;
  hsl: string;
}

const THEME_COLORS: ThemeColor[] = [
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
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

interface ThemeColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ThemeColorPicker = ({ value, onChange }: ThemeColorPickerProps) => {
  return (
    <div className="space-y-3">
      <Label>Cor do Sistema</Label>
      <p className="text-sm text-muted-foreground">
        Selecione a cor principal do sistema. Todos os botões e elementos de destaque usarão essa cor.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {THEME_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "relative h-12 w-full rounded-lg border-2 transition-all hover:scale-105",
              value === color.value
                ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                : "border-border hover:border-foreground/50"
            )}
            style={{ backgroundColor: `hsl(${color.hsl})` }}
            title={color.name}
          >
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-foreground"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Cor selecionada: <strong>{THEME_COLORS.find(c => c.value === value)?.name || "Azul (Padrão)"}</strong>
      </div>
    </div>
  );
};
<<<<<<< HEAD
=======

export const getThemeColorHSL = (colorName: string): string => {
  const color = THEME_COLORS.find(c => c.value === colorName);
  return color?.hsl || "217 91% 60%"; // default blue
};
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
