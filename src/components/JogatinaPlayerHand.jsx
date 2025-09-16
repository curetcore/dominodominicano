import React from 'react'
import { motion } from 'framer-motion'
import JogatinaDomino from './JogatinaDomino'

function JogatinaPlayerHand({ dominoes, isMyTurn, onDominoClick, selectedIndex }) {
  return (
    <div className="bg-gray-800 rounded-t-3xl p-4 border-t-4 border-gray-700">
      {/* Turn indicator */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
            ¡Tu Turno!
          </span>
        </motion.div>
      )}

      {/* Hand container */}
      <div className="flex justify-center items-end gap-2 px-4">
        {dominoes.map((domino, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            className="transition-all duration-150"
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
        ))}
      </div>
      
      {/* Domino count */}
      <div className="text-center mt-2 text-gray-400 text-xs">
        {dominoes.length} fichas
      </div>
    </div>
  )
}

export default JogatinaPlayerHand