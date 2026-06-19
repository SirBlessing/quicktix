// Renders a QR-like SVG pattern for UI purposes.
// The real ticket.qrCode (base64 PNG from backend) is used when available;
// this is only a visual fallback if qrCode hasn't loaded yet.

const PATTERN = [
  [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
  [0,1,0,0,1,0,0,0,0,0,1,1,0,1,0,0,1],
  [1,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1],
  [0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,0,0],
  [1,0,0,0,0,0,1,0,0,0,1,1,0,1,0,1,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,1,0],
  [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,0,1],
]

export default function QRPlaceholder({ size = 150 }) {
  const cell = size / 17
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#fff" />
      {PATTERN.map((row, r) =>
        row.map((cell_, c) =>
          cell_ ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#0D0B1A" /> : null
        )
      )}
    </svg>
  )
}
