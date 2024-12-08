import { hslStringToRgb, getContrastRatio, getWCAGCompliance, rgbToHex } from '../utils/colorUtils';
import { Check, X } from 'lucide-react';

interface ColorAccessibilityProps {
  color: string;
}

export default function ColorAccessibility({ color }: ColorAccessibilityProps) {
  const rgb = hslStringToRgb(color);
  const blackContrast = getContrastRatio(rgb, [0, 0, 0]);
  const whiteContrast = getContrastRatio(rgb, [255, 255, 255]);
  
  const blackWCAG = getWCAGCompliance(blackContrast);
  const whiteWCAG = getWCAGCompliance(whiteContrast);

  const hexColor = rgbToHex(rgb);

  const ComplianceIcon = ({ isCompliant }: { isCompliant: boolean }) => (
    isCompliant ? (
      <Check className="h-3 w-3 text-green-500" />
    ) : (
      <X className="h-3 w-3 text-red-500" />
    )
  );

  return (
    <div className="space-y-4">
      <div className="font-mono text-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border" style={{ backgroundColor: hexColor }} />
          <span>{hexColor}</span>
        </div>
        <div>RGB: rgb({rgb.join(', ')})</div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Contrast Ratios</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-black rounded" />
              <span className="text-sm font-medium">Black: {blackContrast.toFixed(2)}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={blackWCAG.AA.large} />
                <span>AA Large</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={blackWCAG.AA.normal} />
                <span>AA Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={blackWCAG.AAA.large} />
                <span>AAA Large</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={blackWCAG.AAA.normal} />
                <span>AAA Normal</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-white rounded border" />
              <span className="text-sm font-medium">White: {whiteContrast.toFixed(2)}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={whiteWCAG.AA.large} />
                <span>AA Large</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={whiteWCAG.AA.normal} />
                <span>AA Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={whiteWCAG.AAA.large} />
                <span>AAA Large</span>
              </div>
              <div className="flex items-center gap-2">
                <ComplianceIcon isCompliant={whiteWCAG.AAA.normal} />
                <span>AAA Normal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">WCAG 2.1 Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>AA Large: 3:1 (18pt+)</li>
            <li>AA Normal: 4.5:1</li>
            <li>AAA Large: 4.5:1 (18pt+)</li>
            <li>AAA Normal: 7:1</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 