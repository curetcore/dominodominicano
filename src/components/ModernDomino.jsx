import React from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function ModernDomino({ 
  domino, 
  id,
  horizontal = false, 
  hidden = false, 
  onClick, 
  selectable = false, 
  selected = false,
  inHand = false,
  scale = 1,
  disabled = false
}) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: id || `domino-${domino.top}-${domino.bottom}`,
    disabled: !selectable || disabled,
    data: { domino }
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : 'auto',
  } : undefined

  const renderDots = (value) => {
    const patterns = {
      0: [],
      1: [[50, 50]],
      2: [[30, 30], [70, 70]],
      3: [[30, 30], [50, 50], [70, 70]],
      4: [[30, 30], [70, 30], [30, 70], [70, 70]],
      5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
      6: [[30, 25], [30, 50], [30, 75], [70, 25], [70, 50], [70, 75]]
    }

    return patterns[value]?.map((pos, idx) => (
      <div
        key={idx}
        className="absolute rounded-full"
        style={{
          width: `${8 * scale}px`,
          height: `${8 * scale}px`,
          left: `${pos[0]}%`,
          top: `${pos[1]}%`,
          transform: 'translate(-50%, -50%)',
          background: hidden ? '#666' : '#1a1a1a',
          boxShadow: hidden ? 'none' : 'inset 0 1px 2px rgba(0,0,0,0.5)'
        }}
      />
    )) || null
  }

  const baseWidth = horizontal ? 120 : 60
  const baseHeight = horizontal ? 60 : 120

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
      className={`relative ${selectable && !disabled ? 'cursor-pointer' : ''}`}
      onClick={!isDragging && selectable ? onClick : undefined}
      whileHover={selectable && !disabled ? { scale: 1.05 } : {}}
      whileTap={selectable && !disabled ? { scale: 0.95 } : {}}
      animate={{
        y: selected ? -10 : 0,
        rotate: inHand && !horizontal ? (Math.random() - 0.5) * 10 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...(selectable && !disabled ? listeners : {})}
      {...attributes}
    >
      {/* Domino Base */}
      <div 
        className={`
          absolute inset-0 rounded-lg overflow-hidden
          ${hidden ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-100 to-gray-200'}
          ${selected ? 'ring-4 ring-blue-500 ring-opacity-75' : ''}
          transition-all duration-200
        `}
        style={{
          boxShadow: isDragging 
            ? '0 20px 40px rgba(0,0,0,0.3)' 
            : selected 
              ? '0 10px 30px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.2)',
          border: hidden ? '2px solid #444' : '2px solid #333',
          background: hidden 
            ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
        }}
      >
        {/* Texture overlay */}
        {!hidden && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.05) 2px,
                rgba(0,0,0,0.05) 4px
              )`
            }}
          />
        )}
        
        {/* Center line */}
        <div 
          className={`absolute ${horizontal ? 'left-1/2 top-0 bottom-0 w-0.5' : 'left-0 right-0 top-1/2 h-0.5'}`}
          style={{
            background: hidden ? '#333' : '#666',
            boxShadow: hidden ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Halves */}
        <div className={`relative w-full h-full flex ${horizontal ? 'flex-row' : 'flex-col'}`}>
          <div className="relative flex-1 flex items-center justify-center">
            {hidden ? (
              <div className="text-3xl font-bold" style={{color: '#444'}}>?</div>
            ) : (
              renderDots(domino.top)
            )}
          </div>
          <div className="relative flex-1 flex items-center justify-center">
            {hidden ? (
              <div className="text-3xl font-bold" style={{color: '#444'}}>?</div>
            ) : (
              renderDots(domino.bottom)
            )}
          </div>
        </div>
      </div>
      
      {/* Highlight effect */}
      {!hidden && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </motion.div>
  )
}

export default ModernDomino