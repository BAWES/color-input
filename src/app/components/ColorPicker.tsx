import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';
import { getColorName } from '@/app/utils/colorUtils';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function ColorPicker({ 
  value = '#ff0000',
  onChange, 
  trigger,
  className 
}: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(value);
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const colorMapRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  const hexToHsv = (hex: string): [number, number, number] => {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;
    
    if (diff !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / diff) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / diff + 2);
      } else {
        h = 60 * ((r - g) / diff + 4);
      }
    }
    
    h = h < 0 ? h + 360 : h;
    
    return [
      Math.round(h),
      Math.round(s * 100),
      Math.round(v * 100)
    ];
  };

  useEffect(() => {
    const [h, s, v] = hexToHsv(value);
    setHue(h);
    setSaturation(s);
    setBrightness(v);
  }, [value]);

  const hsvToHsl = (h: number, s: number, v: number): [number, number, number] => {
    s /= 100;
    v /= 100;
    const l = v * (1 - s/2);
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return [h, Math.round(sl * 100), Math.round(l * 100)];
  };

  const hsvToHex = (h: number, s: number, v: number): string => {
    s = s / 100;
    v = v / 100;

    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    switch (i) {
      case 0:
      case 6:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      case 5:
        r = v; g = p; b = q;
        break;
    }

    const toHex = (n: number): string => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleColorChange = (h: number, s: number, v: number) => {
    const color = hsvToHex(h, s, v);
    setCurrentColor(color);
    onChange?.(color);
  };

  const handleColorMapInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!colorMapRef.current) return;

    const rect = colorMapRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const newSaturation = Math.round(x * 100);
    const newBrightness = Math.round((1 - y) * 100);

    setSaturation(newSaturation);
    setBrightness(newBrightness);
    handleColorChange(hue, newSaturation, newBrightness);
  };

  const handleHueSliderInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!hueSliderRef.current) return;

    const rect = hueSliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newHue = Math.round(x * 360);
    
    setHue(newHue);
    handleColorChange(newHue, saturation, brightness);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      if (event.target === colorMapRef.current) {
        handleColorMapInteraction(event as any);
      } else if (event.target === hueSliderRef.current) {
        handleHueSliderInteraction(event as any);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [isDragging, hue, saturation, brightness]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className={cn("w-[200px] justify-start text-left font-normal", className)}
          >
            <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: currentColor }} />
            <span className="font-mono">{currentColor.toUpperCase()}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-none">
        <DialogTitle asChild>
          <VisuallyHidden>
            Color Picker - Current color: {currentColor}
          </VisuallyHidden>
        </DialogTitle>
        <div className="w-full h-full bg-background/95 backdrop-blur-md relative flex flex-col">
          {/* Color Preview */}
          <div 
            className="w-full h-[40vh] transition-colors duration-200"
            style={{ backgroundColor: currentColor }}
          >
            <div className="w-full h-full bg-gradient-to-b from-black/0 to-black/20 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-white hover:bg-white/90 text-black"
                  onClick={() => {
                    onChange?.(currentColor);
                    setOpen(false);
                  }}
                >
                  Select Color
                </Button>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {getColorName(...hsvToHsl(hue, saturation, brightness))}
                </h2>
                <div className="font-mono text-white/80">
                  {currentColor.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Color Map */}
          <div className="flex-1 p-6">
            <div 
              ref={colorMapRef}
              className="w-full h-full rounded-xl relative cursor-pointer touch-none shadow-lg"
              style={{
                background: `
                  linear-gradient(to bottom, transparent 0%, black 100%),
                  linear-gradient(to right, white 0%, hsl(${hue}, 100%, 50%) 100%)
                `
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleColorMapInteraction(e);
              }}
              onTouchStart={(e) => {
                setIsDragging(true);
                handleColorMapInteraction(e);
              }}
            >
              <div 
                className="absolute w-8 h-8 border-2 border-white rounded-full shadow-lg transform -translate-x-4 -translate-y-4"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  backgroundColor: currentColor,
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.4)'
                }}
              />
            </div>
          </div>

          {/* Footer with Hue Slider */}
          <div className="w-full p-6 bg-white/5 backdrop-blur-sm border-t">
            <div 
              ref={hueSliderRef}
              className="w-full h-8 rounded-full cursor-pointer touch-none relative shadow-lg"
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleHueSliderInteraction(e);
              }}
              onTouchStart={(e) => {
                setIsDragging(true);
                handleHueSliderInteraction(e);
              }}
            >
              <div 
                className="absolute top-1/2 w-10 h-10 border-2 border-white rounded-full shadow-lg transform -translate-x-5 -translate-y-5"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.4)'
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 