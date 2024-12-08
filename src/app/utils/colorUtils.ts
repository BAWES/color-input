// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (300 <= h && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Convert HSL string to RGB values
export function hslStringToRgb(hsl: string): [number, number, number] {
  const matches = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!matches) return [0, 0, 0];
  
  const [_, h, s, l] = matches.map(Number);
  return hslToRgb(h, s, l);
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const l1 = getLuminance(...color1);
  const l2 = getLuminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Get WCAG compliance levels
export function getWCAGCompliance(contrastRatio: number): {
  AA: { large: boolean; normal: boolean; };
  AAA: { large: boolean; normal: boolean; };
} {
  return {
    AA: {
      large: contrastRatio >= 3,
      normal: contrastRatio >= 4.5
    },
    AAA: {
      large: contrastRatio >= 4.5,
      normal: contrastRatio >= 7
    }
  };
}

// Convert RGB to Hex
export function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Get readable text color (black or white) based on background
export function getReadableTextColor(rgb: [number, number, number]): string {
  const luminance = getLuminance(...rgb);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Color name mapping based on hue ranges
const HUE_NAMES: { [key: string]: string } = {
  '0': 'Red',
  '15': 'Red Orange',
  '30': 'Orange',
  '45': 'Orange Yellow',
  '60': 'Yellow',
  '75': 'Yellow Lime',
  '90': 'Lime',
  '105': 'Lime Green',
  '120': 'Green',
  '135': 'Green Emerald',
  '150': 'Emerald',
  '165': 'Emerald Cyan',
  '180': 'Cyan',
  '195': 'Cyan Azure',
  '210': 'Azure',
  '225': 'Azure Blue',
  '240': 'Blue',
  '255': 'Blue Violet',
  '270': 'Violet',
  '285': 'Violet Purple',
  '300': 'Purple',
  '315': 'Purple Magenta',
  '330': 'Magenta',
  '345': 'Magenta Red'
};

// Lightness descriptors
const getLightnessName = (l: number): string => {
  if (l >= 95) return 'White';
  if (l >= 85) return 'Very Light';
  if (l >= 70) return 'Light';
  if (l >= 45 && l <= 55) return '';
  if (l <= 15) return 'Very Dark';
  if (l <= 30) return 'Dark';
  return '';
};

// Saturation descriptors
const getSaturationName = (s: number): string => {
  if (s <= 5) {
    return 'Gray';
  }
  if (s <= 30) {
    return 'Muted';
  }
  return '';
};

export const getColorName = (h: number, s: number, l: number): string => {
  // Handle grayscale separately
  if (s <= 5) {
    if (l >= 95) return 'White';
    if (l <= 5) return 'Black';
    return `${Math.round(l)}% Gray`;
  }

  // Find the closest hue name
  const hueStep = 15;
  const normalizedHue = Math.round(h / hueStep) * hueStep;
  const normalizedHueKey = (normalizedHue % 360).toString();
  const hueName = HUE_NAMES[normalizedHueKey] || 'Color';

  // Get modifiers based on saturation and lightness
  const saturationName = getSaturationName(s);
  const lightnessName = getLightnessName(l);

  // Combine modifiers and hue name
  const parts = [lightnessName, saturationName, hueName].filter(Boolean);
  return parts.join(' ');
}; 