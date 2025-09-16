import React from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function JogatinaDomino({ 
  domino, 
  id,
  horizontal = false, 
  hidden = false, 
  onClick, 
  selectable = false, 
  selected = false,
  scale = 1,
  disabled = false,
  index
}) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: id || `domino-${index}`,
    disabled: !selectable || disabled,
    data: { domino, index }
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : 'auto',
  } : undefined

  const renderDots = (value) => {
    const patterns = {
      0: [],
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 30], [50, 30], [75, 30], [25, 70], [50, 70], [75, 70]]
    }

    return patterns[value]?.map((pos, idx) => (
      <div
        key={idx}
        className="absolute bg-black rounded-full"
        style={{
          width: `${12 * scale}%`,
          height: `${12 * scale}%`,
          left: `${pos[0]}%`,
          top: `${pos[1]}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    )) || null
  }

  const baseWidth = horizontal ? 80 : 40
  const baseHeight = horizontal ? 40 : 80

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
      animate={{
        y: selected ? -8 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...(selectable && !disabled ? listeners : {})}
      {...attributes}
    >
      {/* Domino Base - Jogatina style: simple white with border */}
      <div 
        className={`
          absolute inset-0 bg-white rounded-lg
          ${selected ? 'ring-4 ring-yellow-400 shadow-lg' : ''}
          ${isDragging ? 'shadow-2xl' : 'shadow-md'}
          transition-all duration-150
        `}
        style={{
          border: '1px solid #ccc',
          background: hidden ? '#2d2d2d' : 'white'
        }}
      >
        {/* Center divider line */}
        <div 
          className={`absolute bg-gray-400 ${horizontal ? 'left-1/2 top-2 bottom-2 w-px' : 'left-2 right-2 top-1/2 h-px'}`}
        />
        
        {/* Halves */}
        <div className={`relative w-full h-full flex ${horizontal ? 'flex-row' : 'flex-col'}`}>
          <div className="relative flex-1">
            {hidden ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-md" />
              </div>
            ) : (
              renderDots(domino.top)
            )}
          </div>
          <div className="relative flex-1">
            {hidden ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-md" />
              </div>
            ) : (
              renderDots(domino.bottom)
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default JogatinaDomino