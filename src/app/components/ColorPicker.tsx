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
  presetColors?: string[];
  defaultColor?: string;
  maxRecentColors?: number;
}

export function ColorPicker({ 
  value = '#ff0000',
  onChange, 
  trigger,
  className,
  presetColors = [],
  defaultColor,
  maxRecentColors = 10
}: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(defaultColor || value);
  const [draftColor, setDraftColor] = useState(defaultColor || value);
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelectingColor, setIsSelectingColor] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const colorMapRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const lastColorRef = useRef<string>(currentColor);

  // Initialize color values when value prop changes
  useEffect(() => {
    const [h, s, v] = hexToHsv(value);
    setHue(h);
    setSaturation(s);
    setBrightness(v);
    setCurrentColor(value);
    setDraftColor(value);
    lastColorRef.current = value;
  }, [value]);

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
    setDraftColor(color);
    lastColorRef.current = color;
  };

  const finalizeColorChange = () => {
    if (isSelectingColor) {
      setCurrentColor(lastColorRef.current);
      onChange?.(lastColorRef.current);
      
      // Add to recent colors if it's not already there
      if (!recentColors.includes(lastColorRef.current)) {
        setRecentColors(prev => [lastColorRef.current, ...prev].slice(0, maxRecentColors));
      }
    }
    setIsSelectingColor(false);
  };

  const handleColorMapInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!colorMapRef.current) return;

    event.preventDefault();

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
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      event.preventDefault();
      
      const target = event.target as HTMLElement;
      if (colorMapRef.current?.contains(target) || isSelectingColor) {
        handleColorMapInteraction(event as any);
      } else if (hueSliderRef.current?.contains(target)) {
        handleHueSliderInteraction(event as any);
      }
    };

    const handleMouseUp = (event: MouseEvent | TouchEvent) => {
      if (isDragging && isSelectingColor) {
        // Get the final position before ending the drag
        handleColorMapInteraction(event as any);
      }
      if (isDragging) {
        setIsDragging(false);
        finalizeColorChange();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isSelectingColor]);

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
            style={{ backgroundColor: isSelectingColor ? draftColor : currentColor }}
          >
            <div className="w-full h-full bg-gradient-to-b from-black/0 to-black/20 p-6 flex flex-col justify-between">
              <div className="flex justify-end items-start">
                <Button
                  className="bg-white hover:bg-white/90 text-black"
                  onClick={() => {
                    setCurrentColor(draftColor);
                    onChange?.(draftColor);
                    setOpen(false);
                  }}
                >
                  Select Color
                </Button>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isSelectingColor 
                    ? getColorName(...hsvToHsl(hue, saturation, brightness))
                    : getColorName(...hsvToHsl(...hexToHsv(currentColor)))}
                </h2>
                <div className="font-mono text-white/80">
                  {(isSelectingColor ? draftColor : currentColor).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Colors */}
          {(recentColors.length > 0 || presetColors.length > 0) && (
            <div className="p-6 border-b">
              <h3 className="text-sm font-medium mb-3">Recently viewed</h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...recentColors, ...presetColors])].slice(0, maxRecentColors).map((color, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded-md border shadow-sm hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const [h, s, v] = hexToHsv(color);
                      setHue(h);
                      setSaturation(s);
                      setBrightness(v);
                      setDraftColor(color);
                      setCurrentColor(color);
                      onChange?.(color);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

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
                e.preventDefault();
                setIsDragging(true);
                setIsSelectingColor(true);
                // Ensure we handle the initial click position
                handleColorMapInteraction(e);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging(true);
                setIsSelectingColor(true);
                // Ensure we handle the initial touch position
                handleColorMapInteraction(e);
              }}
              onClick={(e) => {
                // Handle single click without drag
                if (!isDragging) {
                  handleColorMapInteraction(e);
                  setCurrentColor(draftColor);
                  onChange?.(draftColor);
                  if (!recentColors.includes(draftColor)) {
                    setRecentColors(prev => [draftColor, ...prev].slice(0, maxRecentColors));
                  }
                }
              }}
            >
              <div 
                className="absolute w-8 h-8 border-2 border-white rounded-full shadow-lg transform -translate-x-4 -translate-y-4"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  backgroundColor: isSelectingColor ? draftColor : currentColor,
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