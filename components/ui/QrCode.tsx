import { useMemo } from "react";
import QRCode from "qrcode";

/**
 * A QR code drawn as one SVG path from the encoder's module grid, so it is
 * crisp at any size and needs no innerHTML. Two-module quiet zone included.
 */
export function QrCode({
  value,
  className,
  color = "#080808",
  background = "#ffffff",
}: {
  value: string;
  className?: string;
  color?: string;
  background?: string;
}) {
  const { size, d } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    let path = "";
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.get(row, col)) path += `M${col} ${row}h1v1h-1z`;
      }
    }
    return { size: modules.size, d: path };
  }, [value]);

  return (
    <svg
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill={background} />
      <path d={d} fill={color} />
    </svg>
  );
}
