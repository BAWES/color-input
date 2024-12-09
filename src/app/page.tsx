'use client';

import { useState } from 'react';
import { ColorPicker } from '@/app/components/ColorPicker';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [color, setColor] = useState('#ffffff');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Color Picker Demo</h1>
        <p className="text-muted-foreground">Click the button below to open the color picker</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <ColorPicker
          value={color}
          onChange={setColor}
          defaultColor="#ffffff"
          trigger={
            <Button variant="outline" className="w-[200px]">
              <div 
                className="w-4 h-4 rounded-full border mr-2" 
                style={{ backgroundColor: color }} 
              />
              Pick a Color
            </Button>
          }
        />

        <div className="flex items-center gap-2">
          <div 
            className="w-20 h-20 rounded-lg border shadow-sm" 
            style={{ backgroundColor: color }}
          />
          <div className="text-sm">
            <p className="font-medium">Selected Color:</p>
            <p className="font-mono">{color}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
