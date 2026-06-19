import './QRCodeSVG.css'

/* A static QR-like pattern for UI mockup purposes.
   In production, swap this out for the `react-qr-code` package:
   import QRCode from 'react-qr-code'
   <QRCode value={ticketId} size={140} />
*/

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

function QRCodeSVG({ size = 140, value = '' }) {
  const cellSize = size / 17

  return (
    <svg
      className="qr-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`QR code for ticket ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {PATTERN.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="var(--navy)"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  )
}

export default QRCodeSVG
