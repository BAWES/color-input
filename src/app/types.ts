export interface Color {
  id: string;
  value: string;
  name?: string;
  createdAt: number;
}

export interface Palette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: number;
}

export interface ColorState {
  colors: Color[];
  palettes: Palette[];
  currentColor: string;
} 