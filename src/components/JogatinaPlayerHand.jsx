import React from 'react'
import { motion } from 'framer-motion'
import JogatinaDomino from './JogatinaDomino'

function JogatinaPlayerHand({ dominoes, isMyTurn, onDominoClick, selectedIndex }) {
  return (
    <div className="bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-3xl p-4 shadow-2xl border-t border-gray-600">
      {/* Turn indicator */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              👉
            </motion.div>
            <span>¡Tu Turno!</span>
          </div>
        </motion.div>
      )}

      {/* Hand container */}
      <div className="flex justify-center items-end gap-1.5 px-4">
        {dominoes.map((domino, index) => {
          const angle = (index - dominoes.length / 2) * 3
          return (
            <motion.div
              key={index}
              initial={{ y: 100, opacity: 0, rotate: angle }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                rotate: angle
              }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              whileHover={{ 
                y: -15,
                rotate: 0,
                transition: { duration: 0.2 }
              }}
              className="transition-all duration-150 origin-bottom"
              style={{ zIndex: selectedIndex === index ? 10 : 1 }}
            >
            <JogatinaDomino
              domino={domino}
              id={`hand-${index}`}
              index={index}
              horizontal={false}
              onClick={() => onDominoClick(domino, index)}
              selectable={isMyTurn}
              selected={selectedIndex === index}
              scale={0.9}
            />
            </motion.div>
          )
        })}
      </div>
      
      {/* Bottom info bar */}
      <div className="flex justify-between items-center mt-3 px-4">
        <div className="text-gray-400 text-xs flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Conectado
        </div>
        <div className="text-gray-300 text-sm font-medium">
          {dominoes.length} fichas
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default JogatinaPlayerHand