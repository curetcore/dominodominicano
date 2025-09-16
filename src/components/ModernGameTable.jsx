import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import ModernDomino from './ModernDomino'

function ModernGameTable({ dominoes, leftEnd, rightEnd, onDrop }) {
  const [tableLayout, setTableLayout] = useState({ positions: [], curves: [] })
  
  const { setNodeRef: setLeftRef } = useDroppable({
    id: 'table-left',
    data: { side: 'left' }
  })
  
  const { setNodeRef: setRightRef } = useDroppable({
    id: 'table-right',
    data: { side: 'right' }
  })

  // Calculate snake-like pattern for dominoes
  useEffect(() => {
    if (dominoes.length === 0) return

    const positions = []
    const curves = []
    let x = 0
    let y = 0
    let direction = 'right'
    let angle = 0

    const DOMINO_LENGTH = 100
    const SPACING = 5
    const MAX_WIDTH = 600
    const TURN_RADIUS = 50

    dominoes.forEach((domino, index) => {
      positions.push({ x, y, angle, domino })

      // Calculate next position
      if (direction === 'right' && x > MAX_WIDTH / 2) {
        // Turn down
        curves.push({ x, y, type: 'right-down' })
        direction = 'down'
        angle = 90
      } else if (direction === 'down' && y > 150) {
        // Turn left
        curves.push({ x, y, type: 'down-left' })
        direction = 'left'
        angle = 180
      } else if (direction === 'left' && x < -MAX_WIDTH / 2) {
        // Turn up
        curves.push({ x, y, type: 'left-up' })
        direction = 'up'
        angle = 270
      } else if (direction === 'up' && y < 0) {
        // Turn right
        curves.push({ x, y, type: 'up-right' })
        direction = 'right'
        angle = 0
      }

      // Move to next position
      const distance = DOMINO_LENGTH + SPACING
      switch (direction) {
        case 'right': x += distance; break
        case 'down': y += distance; break
        case 'left': x -= distance; break
        case 'up': y -= distance; break
      }
    })

    setTableLayout({ positions, curves })
  }, [dominoes])

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden">
      {/* Beautiful table background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-3xl">
        {/* Wood texture overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23654321'/%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100' stroke='%23543210' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
        
        {/* Felt texture */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        
        {/* Table border */}
        <div className="absolute inset-4 border-4 border-green-900 rounded-2xl opacity-30" />
      </div>

      {/* Domino placement areas */}
      <div className="relative w-full h-full flex items-center justify-center">
        {dominoes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-white/30 text-2xl mb-2">Mesa vacía</div>
            <div className="text-white/20 text-sm">El jugador con doble 6 empieza</div>
            
            {/* Drop zones */}
            <div 
              ref={setLeftRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 border-4 border-dashed border-white/20 rounded-lg"
              />
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Center point for layout */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Left drop zone */}
              {leftEnd !== null && (
                <motion.div
                  ref={setLeftRef}
                  className="absolute"
                  style={{
                    left: `${tableLayout.positions[0]?.x - 80}px`,
                    top: `${tableLayout.positions[0]?.y - 30}px`,
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-16 h-32 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">{leftEnd}</span>
                  </div>
                </motion.div>
              )}
              
              {/* Right drop zone */}
              {rightEnd !== null && (
                <motion.div
                  ref={setRightRef}
                  className="absolute"
                  style={{
                    left: `${tableLayout.positions[tableLayout.positions.length - 1]?.x + 80}px`,
                    top: `${tableLayout.positions[tableLayout.positions.length - 1]?.y - 30}px`,
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-16 h-32 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 text-xs font-bold">{rightEnd}</span>
                  </div>
                </motion.div>
              )}

              {/* Render dominoes with animation */}
              <AnimatePresence>
                {tableLayout.positions.map((pos, index) => (
                  <motion.div
                    key={`table-domino-${index}`}
                    className="absolute"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: pos.x,
                      y: pos.y,
                      rotate: pos.angle
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      delay: index * 0.05 
                    }}
                    style={{
                      transformOrigin: 'center',
                    }}
                  >
                    <ModernDomino
                      domino={pos.domino}
                      horizontal={pos.angle === 0 || pos.angle === 180}
                      scale={0.8}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Render curve indicators */}
              {tableLayout.curves.map((curve, index) => (
                <motion.div
                  key={`curve-${index}`}
                  className="absolute w-8 h-8"
                  style={{
                    left: `${curve.x}px`,
                    top: `${curve.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-full h-full rounded-full bg-green-600/30 animate-pulse" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-gold-500 rounded-tl-lg opacity-30" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-gold-500 rounded-tr-lg opacity-30" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-gold-500 rounded-bl-lg opacity-30" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-gold-500 rounded-br-lg opacity-30" />
    </div>
  )
}

export default ModernGameTable