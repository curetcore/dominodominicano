import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import JogatinaDomino from './JogatinaDomino'

function JogatinaTable({ dominoes, leftEnd, rightEnd, onDrop }) {
  const { setNodeRef: setLeftRef } = useDroppable({
    id: 'table-left',
    data: { side: 'left' }
  })
  
  const { setNodeRef: setRightRef } = useDroppable({
    id: 'table-right',
    data: { side: 'right' }
  })

  // Simple horizontal layout like Jogatina
  const calculatePosition = (index, total) => {
    const spacing = 45
    const startX = -(total * spacing) / 2 + spacing / 2
    return {
      x: startX + (index * spacing),
      y: 0,
      angle: 0
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Jogatina-style table: simple green background */}
      <div className="absolute inset-0 bg-green-600 rounded-2xl">
        {/* Subtle shadow for depth */}
        <div className="absolute inset-4 bg-green-700 rounded-xl" />
      </div>

      {/* Domino area */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {dominoes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div 
              ref={setLeftRef}
              className="border-3 border-dashed border-green-400 rounded-xl p-8"
            >
              <p className="text-green-100 text-lg font-medium">
                Coloca tu ficha aquí
              </p>
              <p className="text-green-200 text-sm mt-1">
                El jugador con [6|6] empieza
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Left drop zone */}
            {leftEnd !== null && (
              <div
                ref={setLeftRef}
                className="absolute -left-20 top-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-20 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center bg-yellow-400/10"
                >
                  <span className="text-yellow-600 text-xs font-bold rotate-90">{leftEnd}</span>
                </motion.div>
              </div>
            )}
            
            {/* Dominoes in a line */}
            <div className="flex items-center gap-1">
              <AnimatePresence>
                {dominoes.map((domino, index) => {
                  const pos = calculatePosition(index, dominoes.length)
                  return (
                    <motion.div
                      key={`table-${index}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                      }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                    >
                      <JogatinaDomino
                        domino={domino}
                        horizontal={true}
                        scale={1}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            
            {/* Right drop zone */}
            {rightEnd !== null && (
              <div
                ref={setRightRef}
                className="absolute -right-20 top-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-20 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center bg-yellow-400/10"
                >
                  <span className="text-yellow-600 text-xs font-bold rotate-90">{rightEnd}</span>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JogatinaTable