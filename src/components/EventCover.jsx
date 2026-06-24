// EventCover — shows the event's uploaded flyer image, or a clean
// generic placeholder icon (never an emoji) when no image exists.
//
// Two modes:
//   • Fill mode  (no `size` prop): absolutely fills its parent box.
//     Parent must have `position:relative; overflow:hidden;` and a
//     fixed height — used for the big cover banners/cards.
//   • Thumb mode (`size` prop, in px): fixed square thumbnail with
//     rounded corners — used for small inline icons next to text.

export default function EventCover({ src, alt = '', size, dark = false, className = '' }) {
  const isFill = !size
  const wrapperClass = [
    'ev-cover',
    isFill ? 'ev-cover-fill' : 'ev-cover-thumb',
    dark ? 'ev-cover-dark' : '',
    className
  ].filter(Boolean).join(' ')

  const style = isFill ? undefined : { width: size, height: size }

  return (
    <div className={wrapperClass} style={style}>
      {src ? (
        <img src={src} alt={alt} className="ev-cover-img" />
      ) : (
        <div className="ev-cover-placeholder">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}