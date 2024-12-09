# Modern Color Picker Component

A beautiful, accessible, and feature-rich color picker component for React applications. Built with TypeScript, React, and Tailwind CSS.

![Color Picker Preview](preview.png)

## Features

- 🎨 Modern and intuitive interface
- 🔍 HSV color selection with visual feedback
- 💾 Recently viewed colors
- 🎯 Preset colors support
- 📱 Responsive design
- ♿ Keyboard accessible
- 🌈 Color name generation
- 🎯 Default color support

## Installation

```bash
npm install modern-color-picker
# or
yarn add modern-color-picker
```

## Dependencies

This component requires the following peer dependencies:

```json
{
  "react": ">=17.0.0",
  "react-dom": ">=17.0.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "tailwindcss": ">=3.0.0"
}
```

## Usage

1. Import the ColorPicker component:

```tsx
import { ColorPicker } from 'modern-color-picker';
```

2. Basic usage:

```tsx
function App() {
  const [color, setColor] = useState('#ff0000');

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
    />
  );
}
```

3. Advanced usage with preset colors and custom settings:

```tsx
function App() {
  const [color, setColor] = useState('#ff0000');
  const presetColors = ['#ff0000', '#00ff00', '#0000ff'];

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      presetColors={presetColors}
      defaultColor="#ffffff"
      maxRecentColors={5} // Optional: limit the number of recent colors (default: 10)
      trigger={
        <button>
          <div style={{ backgroundColor: color }} />
          Custom Trigger
        </button>
      }
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | '#ff0000' | The current color value in hex format |
| onChange | (color: string) => void | - | Callback function when color changes |
| trigger | React.ReactNode | Default button | Custom trigger element to open the color picker |
| className | string | - | Additional CSS classes for the trigger button |
| presetColors | string[] | [] | Array of preset colors in hex format |
| defaultColor | string | - | Default color to use when component mounts |
| maxRecentColors | number | 10 | Maximum number of recent colors to remember |

## Recent Colors Behavior

The ColorPicker component includes a "Recently viewed" section that shows colors you've interacted with. Here's how it works:

- Colors are stored in component state using React's `useState`
- The history is maintained only during the component's lifecycle
- Colors are automatically cleared when:
  - The component unmounts
  - The page is refreshed
  - The user navigates away
- No persistence between sessions (no localStorage or cookies used)
- Each instance of ColorPicker maintains its own separate history
- Duplicate colors are automatically removed
- Recent colors are combined with preset colors in the UI
- The maximum number of colors shown can be customized with `maxRecentColors`

Example with custom recent colors limit:

```tsx
function App() {
  const [color, setColor] = useState('#ffffff');

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      maxRecentColors={5} // Only keep 5 most recent colors
    />
  );
}
```

## Styling

The component uses Tailwind CSS for styling. Make sure to include the following in your `tailwind.config.js`:

```js
module.exports = {
  content: [
    // ...
    './node_modules/modern-color-picker/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ... your theme extensions
    },
  },
  plugins: [],
}
```

## Accessibility

The color picker is built with accessibility in mind:
- Full keyboard navigation support
- ARIA labels and descriptions
- High contrast visual indicators
- Screen reader support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]
