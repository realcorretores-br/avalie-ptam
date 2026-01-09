import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, Textbox } from "fabric";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import {
  Pencil,
  Square,
  Circle as CircleIcon,
  Type,
  Eraser,
  Undo,
=======
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Eraser, 
  Undo, 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
  Redo,
  Download,
  X
} from "lucide-react";
import { toast } from "sonner";

interface ImageAnnotationProps {
  imageUrl: string;
  onSave: (annotatedImageUrl: string) => void;
  onCancel: () => void;
}

export const ImageAnnotation = ({ imageUrl, onSave, onCancel }: ImageAnnotationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#FF0000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text" | "erase">("draw");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Load the image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const scale = Math.min(800 / img.width, 600 / img.height);
      canvas.setWidth(img.width * scale);
      canvas.setHeight(img.height * scale);
<<<<<<< HEAD

=======
      
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
      const { FabricImage } = await import("fabric");
      const fabricImg = new FabricImage(img, {
        scaleX: scale,
        scaleY: scale,
        selectable: false,
      });
      canvas.backgroundImage = fabricImg;
      canvas.renderAll();
    };
    img.src = imageUrl;

    // Initialize drawing brush
    const brush = new PencilBrush(canvas);
<<<<<<< HEAD
    brush.color = "#FF0000"; // Start with default, let effect update it
=======
    brush.color = activeColor;
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 3;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 3,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 3,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "text") {
      const text = new Textbox("Texto aqui", {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 20,
        fontFamily: "Arial",
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    } else if (tool === "erase") {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        fabricCanvas.remove(activeObject);
      }
    }
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.getObjects().forEach(obj => fabricCanvas.remove(obj));
    toast("Anotações removidas");
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    onSave(dataURL);
    toast("Imagem anotada salva com sucesso!");
  };

  const colors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFFFFF", // White
    "#000000", // Black
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Anotar Imagem</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center border-b pb-4">
            <div className="flex gap-1">
              <Button
                variant={activeTool === "draw" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("draw")}
                title="Desenhar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "rectangle" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("rectangle")}
                title="Retângulo"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "circle" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("circle")}
                title="Círculo"
              >
                <CircleIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "text" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("text")}
                title="Texto"
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "erase" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("erase")}
                title="Apagar"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handleUndo} title="Desfazer">
                <Undo className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Color picker */}
            <div className="flex gap-1 items-center">
              <Label className="text-sm">Cor:</Label>
              {colors.map((color) => (
                <button
                  key={color}
<<<<<<< HEAD
                  className={`w-8 h-8 rounded border-2 ${activeColor === color ? "border-primary" : "border-border"
                    }`}
=======
                  className={`w-8 h-8 rounded border-2 ${
                    activeColor === color ? "border-primary" : "border-border"
                  }`}
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>

            <div className="h-8 w-px bg-border" />

            <Button variant="outline" onClick={handleClear}>
              Limpar Tudo
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex justify-center border rounded-lg p-4 bg-muted/50">
            <canvas ref={canvasRef} className="max-w-full shadow-lg" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Download className="h-4 w-4 mr-2" />
              Salvar Anotações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
