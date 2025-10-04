import { useState, MouseEvent } from 'react'

type RippleType = {
  x: number
  y: number
  size: number
  id: number
}

type Props = {
  children: React.ReactNode
  color?: string
  duration?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
}

/**
 * RippleEffect - Material Design ripple effect wrapper
 * Adds a wave/ripple animation on click
 * Default duration: 850ms (Material Design standard)
 */
export function RippleEffect({
  children,
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 850,
  className = '',
  style = {},
  onClick,
  disabled = false
}: Props) {
  const [ripples, setRipples] = useState<RippleType[]>([])
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const newRipple: RippleType = {
      x,
      y,
      size,
      id: Date.now()
    }

    setRipples([...ripples, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, duration)

    // Call the onClick handler if provided
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      onClick={handleClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color,
          opacity: isHovered ? 0.08 : 0,
          transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none'
        }}
      />
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            pointerEvents: 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}