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
      {/* Jogatina-style table: green felt texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-2xl">
        {/* Felt texture effect */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        {/* Inner border */}
        <div className="absolute inset-2 border-2 border-green-800/30 rounded-2xl" />
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
              className="bg-green-500/30 border-2 border-dashed border-yellow-400/60 rounded-2xl p-8 backdrop-blur-sm"
            >
              <p className="text-white text-lg font-semibold drop-shadow-md">
                Coloca tu ficha aquí
              </p>
              <p className="text-green-100 text-sm mt-2">
                El jugador con el doble seis empieza
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
                  className="w-14 h-24 border-2 border-dashed border-yellow-400/70 rounded-xl flex items-center justify-center bg-yellow-400/20 backdrop-blur-sm"
                >
                  <span className="text-white text-sm font-bold drop-shadow-lg">{leftEnd}</span>
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
                  className="w-14 h-24 border-2 border-dashed border-yellow-400/70 rounded-xl flex items-center justify-center bg-yellow-400/20 backdrop-blur-sm"
                >
                  <span className="text-white text-sm font-bold drop-shadow-lg">{rightEnd}</span>
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